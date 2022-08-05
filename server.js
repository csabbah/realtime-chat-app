const express = require('express');
const path = require('path');
const app = express();

const formatMessage = require('./utils/messages');
const {
  getCurrentUser,
  userJoin,
  userLeave,
  getRoomUsers,
} = require('./utils/users');

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
  socket.on('joinRoom', ({ username, room }) => {
    // We pass the id from the socket so it's unique to each user
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    // emit() will emit to the single client connecting
    // socket.emit('object', { welcome: 'Welcome to ChatCord' });
    socket.emit('message', formatMessage(botName, `Welcome to ChatCord`));

    // Broadcast when a user connects (GENERAL NOT ROOM SPECIFIC)
    // broadcast.emit() will emit to everyone EXCEPT for the person connecting
    // socket.broadcast.emit(
    //   'message',
    //   formatMessage(botName, 'A user has joined the chat')
    // );

    // Broadcast when a user connects (TO A SPECIFIC ROOM)
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `A ${user.username} has joined the chat`)
      );

    // Send active users and room info
    io.to(user.room).emit('roomInfo', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // We log the message in the backend
  //   console.log('New WS connection...');

  // Here are the events to be fired off on the client side
  const botName = 'ChatCord Bot';

  // io.emit() will emit to EVERYONE
  // io.emit();

  // Here are the events to be fired off when client side emits to the sever
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    // If user exists
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `A ${user.username} has disconnected`)
      );

      // Send users and room info
      io.to(user.room).emit('roomInfo', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Local and or environment variable named port
const PORT = 3000 || process.env.PORT;

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));