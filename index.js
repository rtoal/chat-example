/*
 * Coin game server.
 *
 * This is the entry point for the Node.js application.
 */

const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const game = require('./server/game');

// Images, scripts, stylesheets, and other assets will be in this directory.
app.use(express.static('public'));

// The client application lives on a single HTML page.
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', (socket) => {
  // When first connected, don't accept any messages except `name`. Keep accepting name
  // messages until a name is accepted. When a name is finally accepted, send a `welcome`
  // message and a the current game state, "turn off" the `name` message listener, then
  // start accepting `move` messages.
  const nameListener = (name) => {
    const trimmedName = name.trim();
    socket.on('goodname', (goodname) => {
      if (goodname) {
        io.to(socket.id).emit('welcome');
        game.state(io);
        socket.removeListener('name', nameListener);
        socket.removeListener('goodname', nameListener);
        socket.on('move', (direction) => {
          game.move(direction, trimmedName, io);
        });
      } else {
        io.to(socket.id).emit('badname', trimmedName);
      }
    });
    game.addPlayer(trimmedName, io, socket);
  };
  socket.on('name', nameListener);
});

// It begins (https://xkcd.com/1656/)
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
