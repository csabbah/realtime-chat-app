const socket = io();
// We have access to io() because of this in chat.html:
// <script src="/socket.io/socket.io.js"></script>

// Whenever we get this 'message' event
// These events are established in the server.js file
// socket.on('object', (object) => {
//   console.log(object);
// });

socket.on('message', (message) => {
  console.log(message);
});
