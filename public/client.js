(() => {
  const socket = io(); // eslint-disable-line no-undef
  const canvas = document.querySelector('canvas');
  const tableBody = document.querySelector('tbody');

  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  function clearCanvas() {
    ctx.clearRect(0, 0, 640, 640);
  }

  // TODO: We need to draw players in different colors, perhaps with user-selectable avatars,
  // or at least as a dark square with a big white capital letter derived from their name.
  function drawPlayers(gameState) {
    gameState.positions.forEach(([name, position]) => {
      const [row, column] = position.split(',');
      // ctx.fillStyle = `hsla(${Math.floor(Math.random() * 260) + 100}, 100%, 48%, 1)`; // Mebbe?
      ctx.fillStyle = '#60c';
      ctx.fillRect(row * 10, column * 10, 10, 10);
      ctx.fillStyle = 'white';
      ctx.fillText(name[0].toUpperCase(), (row * 10) + 5, (column * 10) + 5);
    });
  }

  function drawCoins(gameState) {
    Object.entries(gameState.coins).forEach(([key, value]) => {
      const [row, column] = key.split(',');
      ctx.fillStyle = 'black';
      ctx.fillText(value, (row * 10) + 5, (column * 10) + 5);
    });
  }

  // To draw the scoreboard, first remove all the table rows corresponding to scores
  // (these are the <tr> elements with the `score` class). This leaves the rows with the
  // table headers intact. Then iterate through the name-score pairs and add new rows to
  // the table.
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

  // Send the entered name to the server in a `name` message.
  document.querySelector('button').addEventListener('click', () => {
    socket.emit('name', document.querySelector('#name').value);
  });

  // Players move on the arrow keys only; each valid keystroke sends a `move` message with a
  // single-character argument over the socket to the server.
  document.addEventListener('keydown', (e) => {
    const command = { 38: 'U', 40: 'D', 37: 'L', 39: 'R' }[e.keyCode];
    if (command) {
      socket.emit('move', command);
      e.preventDefault();
    }
  });

  // When the server sends the `welcome` message, hide the lobby for and show the game board.
  socket.on('welcome', () => {
    document.querySelector('div#lobby').style.display = 'none';
    document.querySelector('div#game').style.display = 'block';
  });

  // When the server sends us a `state` message, we render the game state it sends us.
  socket.on('state', renderBoard);

  socket.on('badname', (name) => {
    document.querySelector('.error').innerHTML = `Name ${name} too short, too long, or taken`;
  });
})();
