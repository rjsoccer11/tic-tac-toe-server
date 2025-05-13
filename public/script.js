const socket = io();

let playerSymbol = '';
let room = '';
let gameEnded = false;

const joinScreen = document.getElementById('joinScreen');
const gameScreen = document.getElementById('gameScreen');
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const joinError = document.getElementById('joinError');

document.getElementById('joinBtn').onclick = () => {
  const username = document.getElementById('username').value.trim();
  room = document.getElementById('room').value.trim();

  if (!username || !room) {
    joinError.textContent = 'Name and room are required.';
    return;
  }

  document.getElementById('joinBtn').disabled = true; // 🔒 Disable after first click
  socket.emit('joinRoom', { username, room });
};

socket.on('playerInfo', ({ symbol, room: r }) => {
  playerSymbol = symbol;
  room = r;
});

socket.on('roomFull', () => {
  joinError.textContent = 'Room is full!';
  document.getElementById('joinBtn').disabled = false; // 🔓 Enable if join failed
});

socket.on('startGame', ({ board, currentPlayer, usernames }) => {
  joinScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  gameEnded = false;
  restartBtn.style.display = 'none';
  drawBoard(board);
  statusEl.textContent = currentPlayer === playerSymbol ? 'Your turn' : "Opponent's turn";
});

boardEl.addEventListener('click', e => {
  if (!e.target.classList.contains('cell') || gameEnded) return;
  const index = e.target.dataset.index;
  if (e.target.textContent === '' && statusEl.textContent === 'Your turn') {
    socket.emit('move', { room, index, symbol: playerSymbol });
  }
});

socket.on('updateBoard', ({ board, currentPlayer }) => {
  drawBoard(board);
  statusEl.textContent = currentPlayer === playerSymbol ? 'Your turn' : "Opponent's turn";
});

socket.on('gameEnd', ({ result }) => {
  gameEnded = true;
  restartBtn.style.display = 'inline-block';
  if (result === 'Draw') {
    alert("It's a draw!");
  } else {
    alert(`Player ${result} wins!`);
  }
});

socket.on('playerLeft', () => {
  alert('Opponent left. Game over.');
  window.location.reload();
});

restartBtn.onclick = () => {
  gameEnded = false; // ✅ Allow moves again
  restartBtn.style.display = 'none';
  statusEl.textContent = playerSymbol === 'X' ? 'Your turn' : "Opponent's turn";
  socket.emit('restartGame', room);
};

function drawBoard(board) {
  boardEl.innerHTML = '';
  board.forEach((cell, i) => {
    const div = document.createElement('div');
    div.classList.add('cell');
    div.dataset.index = i;
    div.textContent = cell || '';
    if (cell) div.classList.add('taken');
    boardEl.appendChild(div);
  });
}
