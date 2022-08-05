const express = require('express');
const path = require('path');
const app = express();

const formatMessage = require('./utils/messages');

const http = require('http');
const server = http.createServer(app);

const socketIo = require('socket.io');
const { emit } = require('process');
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

  // We log the message  in the backend
  //   console.log('New WS connection...');

  // Here are the events to be fired off on the client side

  const botName = 'ChatCord Bot';

  // Welcome current user
  // emit() will emit to the single client connecting
  // socket.emit('object', { welcome: 'Welcome to ChatCord' });
  socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

  // Broadcast when a user connects
  // broadcast.emit() will emit to everyone EXCEPT for the person connecting
  socket.broadcast.emit(
    'message',
    formatMessage(botName, 'A user has joined the chat')
  );

  // Runs when client disconnects
  socket.on('disconnected', () => {
    io.emit('message', formatMessage(botName, 'A user has disconnected'));
  });

  // io.emit() will emit to EVERYONE
  //   io.emit();

  // Here are the events to be fired off when client side emits to the sever
  socket.on('chatMessage', (msg) => {
    io.emit('message', formaMessatMessage('USER', msg));
  });
});

// Local and or environment variable named port
const PORT = 3000 || process.env.PORT;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
