const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

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

const exphbs = require('express-handlebars');
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Set static folder
app.use(express.static(path.join(__dirname, 'Public')));

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    let colorNum = Math.ceil(Math.random(0) * 200);

    // We pass the id from the socket so it's unique to each user
    // Here we essentially create the user object that contains info about the user
    const user = userJoin(socket.id, username, room, colorNum);

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
        formatMessage(
          botName,
          `A <span style='color:hsl(${user.colorNum}, 100%, 50%)'>${user.username}</span> has joined the chat`
        )
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

    if (user) {
      // When a user sends a message, capture that message, their user name and...
      io.to(user.room).emit(
        'message',
        formatMessage(user.username, msg, user.colorNum)
      );
      socket.broadcast.to(user.room).emit('typing', user.username);
    }
  });

  socket.on('userTyping', (boolean) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      if (boolean) {
        // If input is not empty, generate the 'is typing' element on the client side
        socket.broadcast.to(user.room).emit('typing', user.username);
      } else {
        // If input is empty, emit userTyped which removes the 'is typing' element
        socket.broadcast.to(user.room).emit('userTyped', user.username);
      }
    }
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

app.use(require('./app/controllers'));

// Run the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
