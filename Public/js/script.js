const socket = io();

const chatForm = document.getElementById('chat-form');

// submit and emit the 'chatMessage' event which takes the submitted message
// And emits a new io.emit() event
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get message text from DOM element
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear inputs
  chatForm.reset();
});

// We have access to io() because of this in chat.html:
// <script src="/socket.io/socket.io.js"></script>

// Whenever we get this 'message' event
// These events are established in the server.js file
// socket.on('object', (object) => {
//   console.log(object);
// });

// Update dom element with message
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  div.innerHTML = `
   <p class="meta">Brad <span>9:12pm</span></p>
    <p class="text">
    ${message}
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
