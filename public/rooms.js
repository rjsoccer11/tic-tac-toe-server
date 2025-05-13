const socket = io();
const roomList = document.getElementById('roomList');
const username = localStorage.getItem('username');

if (!username) {
  alert('No username found. Redirecting...');
  window.location.href = '/index.html';
} else {
  socket.emit('createUsername', username);
}

function refreshRooms() {
  socket.emit('getRooms');
}

document.getElementById('createRoom').onclick = () => {
  const room = document.getElementById('newRoom').value.trim();
  if (room) {
    socket.emit('joinRoom', room);
    window.location.href = '/game.html?room=' + room;
  }
};

socket.on('roomList', rooms => {
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    roomList.innerHTML = '<li>No rooms available</li>';
  }
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.textContent = room;
    li.onclick = () => {
      socket.emit('joinRoom', room);
      window.location.href = '/game.html?room=' + room;
    };
    roomList.appendChild(li);
  });
});

refreshRooms();
setInterval(refreshRooms, 3000);
