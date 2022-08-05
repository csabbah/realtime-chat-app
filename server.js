const express = require('express');
const path = require('path');
const app = express();

const http = require('http');
const server = http.createServer(app);

const socketIo = require('socket.io');
const io = socketIo(server);

// Example route
// app.use('/test', (res, req) => {
//   req.send('hi');
// });

// Set static folder
app.use(express.static(path.join(__dirname, './public')));

// Run when client connects
io.on('connection', (socket) => {
  // This of this as opening a door between server and client
  // we can emit events
  console.log('New WS connection...');
  socket.emit('object', { welcome: 'Welcome to ChatCord' });
  socket.emit('message', 'Welcome to ChatCord');
}); // Listen for a connection

// Local and or environment variable named port
const PORT = 3000 || process.env.PORT;
// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
