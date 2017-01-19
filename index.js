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
  console.log('Connection')
  socket.on('move', (direction) => {
    console.log('move', direction)
    game.move(direction);
    io.emit('state', game.state());
  });
  socket.on('state', () => {
    console.log('state')
    io.emit('state', game.state());
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
