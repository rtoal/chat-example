'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  var socket = io(); // eslint-disable-line no-undef
  var canvas = document.querySelector('canvas');
  var tableBody = document.querySelector('tbody');

  var ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  var CELL_SIZE = 10;
  var HALF_CELL_SIZE = CELL_SIZE / 2;

  function clearCanvas() {
    ctx.clearRect(0, 0, 640, 640);
  }

  function fillCell(row, column, text, textColor, backgroundColor) {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(row * CELL_SIZE, column * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    ctx.fillStyle = textColor;
    ctx.fillText(text, row * CELL_SIZE + HALF_CELL_SIZE, column * CELL_SIZE + HALF_CELL_SIZE);
  }

  function drawPlayers(gameState) {
    gameState.positions.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          name = _ref2[0],
          position = _ref2[1];

      fillCell.apply(undefined, _toConsumableArray(position.split(',')).concat([name[0].toUpperCase(), 'white', '#60c']));
    });
  }

  function drawCoins(gameState) {
    Object.entries(gameState.coins).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          position = _ref4[0],
          coinValue = _ref4[1];

      fillCell.apply(undefined, _toConsumableArray(position.split(',')).concat([coinValue, 'black']));
    });
  }

  // To draw the scoreboard, first remove all the table rows corresponding to scores
  // (these are the <tr> elements with the `score` class). This leaves the rows with the
  // table headers intact. Then iterate through the name-score pairs and add new rows to
  // the table. We trust the server to send us the scores in the correct sorted order.
  function drawScores(gameState) {
    document.querySelectorAll('tr.score').forEach(function (e) {
      return e.remove();
    });
    gameState.scores.forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          name = _ref6[0],
          score = _ref6[1];

      var tableRow = document.createElement('tr');
      tableRow.innerHTML = '<td>' + name + '<td>' + score;
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
  document.querySelector('button').addEventListener('click', function () {
    socket.emit('name', document.querySelector('#name').value);
  });

  // When an arrow key is pressed, send a `move` message with a single-character argument
  // to the server.
  document.addEventListener('keydown', function (e) {
    var command = { 38: 'U', 40: 'D', 37: 'L', 39: 'R' }[e.keyCode];
    if (command) {
      socket.emit('move', command);
      e.preventDefault();
    }
  });

  // When the server tells us the name is bad, render an error message.
  socket.on('badname', function (name) {
    document.querySelector('.error').innerHTML = 'Name ' + name + ' too short, too long, or taken';
  });

  // When the server sends us the `welcome` message, hide the lobby for and show the game board.
  socket.on('welcome', function () {
    document.querySelector('div#lobby').style.display = 'none';
    document.querySelector('div#game').style.display = 'block';
  });

  // When the server sends us a `state` message, render the game state it sends us.
  socket.on('state', renderBoard);
})();