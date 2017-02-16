(() => {
  const socket = io(); // eslint-disable-line no-undef
  const canvas = document.querySelector('canvas');
  const tableBody = document.querySelector('tbody');

  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const CELL_SIZE = 10;
  const HALF_CELL_SIZE = CELL_SIZE / 2;

  function clearCanvas() {
    ctx.clearRect(0, 0, 640, 640);
  }

  function fillCell(row, column, text, textColor, backgroundColor) {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(row * CELL_SIZE, column * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    ctx.fillStyle = textColor;
    ctx.fillText(text, (row * CELL_SIZE) + HALF_CELL_SIZE, (column * CELL_SIZE) + HALF_CELL_SIZE);
  }

  function drawPlayers(gameState) {
    gameState.positions.forEach(([name, position]) => {
      fillCell(...position.split(','), name[0].toUpperCase(), 'white', '#60c');
    });
  }

  function drawCoins(gameState) {
    console.log(gameState);
    gameState.coins.forEach(([position, coinValue]) => {
      fillCell(...position.split(','), coinValue, 'black');
    });
  }

  // To draw the scoreboard, first remove all the table rows corresponding to scores
  // (these are the <tr> elements with the `score` class). This leaves the rows with the
  // table headers intact. Then iterate through the name-score pairs and add new rows to
  // the table. We trust the server to send us the scores in the correct sorted order.
  function drawScores(gameState) {
    document.querySelectorAll('tr.score').forEach(e => e.remove());
    gameState.scores.forEach(([name, score]) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `<td>${name}<td>${score}`;
      tableRow.className = 'score';
      tableBody.appendChild(tableRow);
    });
  }

  function renderBoard(gameState) {
    clearCanvas();
    drawCoins(gameState);
    drawPlayers(gameState);
    drawScores(gameState);
  }

  // When the join button is clicked, send the name to the server in a `name` message.
  document.querySelector('button').addEventListener('click', () => {
    socket.emit('name', document.querySelector('#name').value);
  });

  // When an arrow key is pressed, send a `move` message with a single-character argument
  // to the server.
  document.addEventListener('keydown', (e) => {
    const command = { 38: 'U', 40: 'D', 37: 'L', 39: 'R' }[e.keyCode];
    if (command) {
      socket.emit('move', command);
      e.preventDefault();
    }
  });

  // When the server tells us the name is bad, render an error message.
  socket.on('badname', (name) => {
    document.querySelector('.error').innerHTML = `Name ${name} too short, too long, or taken`;
  });

  // When the server sends us the `welcome` message, hide the lobby for and show the game board.
  socket.on('welcome', () => {
    document.querySelector('div#lobby').style.display = 'none';
    document.querySelector('div#game').style.display = 'block';
  });

  // When the server sends us a `state` message, render the game state it sends us.
  socket.on('state', renderBoard);
})();
