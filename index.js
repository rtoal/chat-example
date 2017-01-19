const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const game = require('./game');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'))

io.on('connection', (socket) => {
  // TODO: We need a scheme for collecting player names.

  // Accept a move from the client and perform it. Then respond with the game state.
  socket.on('move', (direction) => {
    game.move(direction);
    // TODO: THIS NEEDS TO BE BROADCAST TO EVERYONE.
    io.emit('state', game.state());
  });

  // Send the game state whenever the client asks.
  socket.on('state', () => {
    io.emit('state', game.state());
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
