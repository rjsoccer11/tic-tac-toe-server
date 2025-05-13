const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = [];
let board = Array(9).fill(null);
let currentPlayer = 'X';

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  if (players.length < 2) {
    players.push(socket);
    socket.emit('player', players.length === 1 ? 'X' : 'O');
  }

  socket.on('move', ({ index, symbol }) => {
    if (board[index] === null && symbol === currentPlayer) {
      board[index] = symbol;
      currentPlayer = symbol === 'X' ? 'O' : 'X';
      io.emit('update', { board, currentPlayer });
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p !== socket);
    board = Array(9).fill(null);
    currentPlayer = 'X';
    io.emit('reset');
  });

  socket.on('restart', () => {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  io.emit('restartGame', { board, currentPlayer });
});
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
