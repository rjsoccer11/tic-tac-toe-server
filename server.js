const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = {};

app.use(express.static('public'));

const rooms = {}; // { roomId: { players: [socket.id], board, currentPlayer, usernames } }

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('createUsername', username => {
    socket.username = username;
    socket.emit('usernameCreated');
  });

  socket.on('getRooms', () => {
    const openRooms = Object.keys(rooms).filter(roomId => rooms[roomId].players.length < 2);
    socket.emit('roomList', openRooms);
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

  // Notify player joined
  const players = rooms[roomName].map(id => users[id]);
  io.to(roomName).emit('playerList', players);
});

  socket.on('move', ({ room, index, symbol }) => {
    const game = rooms[room];
    if (!game || game.board[index] !== null || game.currentPlayer !== symbol) return;

    game.board[index] = symbol;
    game.currentPlayer = symbol === 'X' ? 'O' : 'X';

    io.to(room).emit('updateBoard', {
      board: game.board,
      currentPlayer: game.currentPlayer
    });

    const winner = checkWinner(game.board);
    if (winner) {
      io.to(room).emit('gameEnd', { result: winner });
    } else if (game.board.every(cell => cell)) {
      io.to(room).emit('gameEnd', { result: 'Draw' });
    }
  });

  socket.on('restartGame', room => {
    const game = rooms[room];
    if (!game) return;
    game.board = Array(9).fill(null);
    game.currentPlayer = 'X';
    io.to(room).emit('updateBoard', {
      board: game.board,
      currentPlayer: game.currentPlayer
    });
  });

  socket.on('disconnect', () => {
  const roomName = socket.room;
  if (roomName && rooms[roomName]) {
    rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);
    if (rooms[roomName].length === 0) {
      delete rooms[roomName]; // Clean up
    } else {
      const players = rooms[roomName].map(id => users[id]);
      io.to(roomName).emit('playerList', players);
    }
  }

  delete users[socket.id];
});

function checkWinner(board) {
  const winCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (let [a,b,c] of winCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
