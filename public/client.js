(() => {
  const canvas = document.querySelector('canvas');
  const table = document.querySelector('table');
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  function clearCanvas() {
    ctx.clearRect(0, 0, 640, 640);
  }

  function drawPlayers(gameState) {
    gameState.positions.forEach(([name, position]) => {
      const [row, column] = position.split(',');
      console.log(name, row, column);
      ctx.fillStyle = 'red';
      ctx.fillRect(row * 10, column * 10, 10, 10);
    });
  }

  function drawCoins(gameState) {
    Object.entries(gameState.coins).forEach(([key, value]) => {
      const [row, column] = key.split(',');
      ctx.fillStyle = 'black';
      ctx.fillText(value, (row * 10) + 5, (column * 10) + 5);
    });
  }

  function renderBoard(gameState) {
    clearCanvas();
    console.log(gameState);
    drawCoins(gameState);
    drawPlayers(gameState);
  }

  document.addEventListener('keydown', (e) => {
    const command = { 38: 'U', 40: 'D', 37: 'L', 39: 'R' }[e.keyCode];
    if (command) {
      socket.emit('move', command);
      e.preventDefault();
    }
  });

  const socket = io();

  socket.on('state', function(gameState){
    renderBoard(gameState);
  });

  socket.emit('state');
})();
