const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const game = require('./game');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Images, scripts, stylesheets, will be in this directory.
app.use(express.static('public'))

io.on('connection', (socket) => {
  // TODO: We need a scheme for collecting player names.

  // Send state right when the client connects.
  io.emit('state', game.state());

  // Accept a move from the client and perform it. Then broadcast the game state.
  socket.on('move', (direction) => {
    game.move(direction);
    io.emit('state', game.state());
  });
});

const port = process.env.port || 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${3000}`);
});
