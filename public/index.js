const socket = io();
document.getElementById('submitName').onclick = () => {
  const name = document.getElementById('username').value.trim();
  if (name) {
    localStorage.setItem('username', name); // ✅ Save it
    socket.emit('createUsername', name);
  }
};
socket.on('usernameCreated', () => {
  window.location.href = '/rooms.html';
});
