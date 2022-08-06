const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();

// Get username and room from URL
// CDN link in chat.html
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// Join chatroom
socket.emit('joinRoom', { username, room });

// submit and emit the 'chatMessage' event which takes the submitted message
// And emits a new io.emit() event
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get message text from DOM element
  const msg = e.target.elements.msg.value;
  console.log(msg);

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear inputs
  chatForm.reset();
  // Focus on the msg input right after
  e.target.elements.msg.focus();
});

// We have access to io() because of this in chat.html:
// <script src="/socket.io/socket.io.js"></script>

// Whenever we get this 'message' event
// These events are established in the server.js file
// socket.on('object', (object) => {
//   console.log(object);
// });

// Update dom element with message
function outputMessage(object) {
  const div = document.createElement('div');
  div.classList.add('message');

  div.innerHTML = `
   <p class="meta">${object.username}<span> ${object.time}</span></p>
    <p class="text">
    ${object.text}
    </p>
  `;

  document.querySelector('.chat-messages').appendChild(div);
}

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Every time we get a message, scroll down
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
    `;
  // Because we are mapping an array, we NEED to use the .join() method
}

// Get room and users
socket.on('roomInfo', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
