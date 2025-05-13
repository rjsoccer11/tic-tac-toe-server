const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');

let playerSymbol = '';
let gameEnded = false;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

socket.on('playerInfo', ({ symbol }) => {
  playerSymbol = symbol;
});

socket.on('startGame', ({ board, currentPlayer }) => {
  drawBoard(board);
  statusEl.textContent = currentPlayer === playerSymbol ? 'Your turn' : "Opponent's turn";
});

socket.on('updateBoard', ({ board, currentPlayer }) => {
  drawBoard(board);
  statusEl.textContent = currentPlayer === playerSymbol ? 'Your turn' : "Opponent's turn";
});

socket.on('gameEnd', ({ result }) => {
  gameEnded = true;
  restartBtn.style.display = 'inline-block';
  alert(result === 'Draw' ? "It's a draw!" : `Player ${result} wins!`);
});

socket.on('playerLeft', () => {
  alert('Opponent left. Game over.');
  window.location.href = '/rooms.html';
});

restartBtn.onclick = () => {
  gameEnded = false;
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
    if (cell || gameEnded) div.classList.add('taken');
    div.onclick = () => {
      if (!cell && !gameEnded && statusEl.textContent === 'Your turn') {
        socket.emit('move', { room, index: i, symbol: playerSymbol });
      }
    };
    boardEl.appendChild(div);
  });
}