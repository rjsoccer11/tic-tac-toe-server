const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};
const rooms = {};

io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  socket.on('createUsername', username => {
    users[socket.id] = username;
  });

  socket.on('getRooms', () => {
    socket.emit('roomList', Object.keys(rooms));
  });

  socket.on('joinRoom', roomName => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    if (rooms[roomName].length >= 2) {
      socket.emit('roomFull');
      return;
    }

    rooms[roomName].push(socket.id);
    socket.join(roomName);
    socket.room = roomName;

    const players = rooms[roomName].map(id => users[id]);
    io.to(roomName).emit('playerList', players);
  });

  socket.on('makeMove', ({ room, index }) => {
    socket.to(room).emit('opponentMove', index);
  });

  socket.on('restartGame', room => {
    io.to(room).emit('restartGame');
  });

  socket.on('disconnect', () => {
    const roomName = socket.room;
    if (roomName && rooms[roomName]) {
      rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];
      } else {
        const players = rooms[roomName].map(id => users[id]);
        io.to(roomName).emit('playerList', players);
      }
    }

    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
