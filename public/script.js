const socket = io();
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

let playerSymbol = '';
let currentTurn = 'X';
let board = Array(9).fill(null);
let gameEnded = false;

// Create game board
function createBoard() {
  boardEl.innerHTML = '';
  board = Array(9).fill(null);
  gameEnded = false;
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    boardEl.appendChild(cell);
  }
}

// Check for winner or draw
function checkGameStatus() {
  const winningCombos = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // columns
    [0,4,8],[2,4,6]          // diagonals
  ];

  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return winner symbol
    }
  }

  if (board.every(cell => cell)) {
    return 'Draw';
  }

  return null;
}

function handleGameEnd(result) {
  gameEnded = true;
  restartBtn.style.display = 'inline-block';

  if (result === 'Draw') {
    alert("It's a draw!");
  } else {
    alert(`Player ${result} wins!`);
  }
}

// Handle player assignment
socket.on('player', symbol => {
  playerSymbol = symbol;
  statusEl.textContent = `You are Player ${symbol}`;
  createBoard();
});

// Handle click
boardEl.addEventListener('click', e => {
  if (!e.target.classList.contains('cell')) return;
  const index = e.target.dataset.index;
  if (currentTurn === playerSymbol && board[index] === null && !gameEnded) {
    socket.emit('move', { index, symbol: playerSymbol });
  }
});

// Update board from server
socket.on('update', ({ board: newBoard, currentPlayer }) => {
  board = newBoard;
  const cells = document.querySelectorAll('.cell');
  board.forEach((value, index) => {
    if (value) {
      cells[index].textContent = value;
      cells[index].classList.add('taken');
    } else {
      cells[index].textContent = '';
      cells[index].classList.remove('taken');
    }
  });

  currentTurn = currentPlayer;
  statusEl.textContent = currentTurn === playerSymbol ? 'Your turn' : "Opponent's turn";

  const result = checkGameStatus();
  if (result) {
    handleGameEnd(result);
  }
});

// Reset board when opponent disconnects
socket.on('reset', () => {
  statusEl.textContent = 'Opponent disconnected. Waiting...';
  createBoard();
  restartBtn.style.display = 'none';
});

// Handle restart
restartBtn.addEventListener('click', () => {
  socket.emit('restart');
});
