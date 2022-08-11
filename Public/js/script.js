const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const msgEl = document.getElementById('msg');
scrollBottomBtn = document.querySelector('.scrollBottom');

// We have access to io() because of this in chat.html:
// <script src="/socket.io/socket.io.js"></script>
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

  // Emit message to server
  socket.emit('chatMessage', msg);
  socket.emit('userTyping', false);

  // Clear inputs
  chatForm.reset();
  // Focus on the msg input right after
  e.target.elements.msg.focus();
  // Reset on keydown event
  fired = false;
});

var fired = false;
msgEl.addEventListener('keyup', (e) => {
  // If Enter was hit, do not emit the userTyping because it is being emitted from the submit event above
  if (e.code === 'Enter') {
    // Focus on the input when 'enter' is hit
    msgEl.focus();
    // Otherwise, emit userTyping below on keyup to ensure that it dynamically updates as users are type
  } else {
    // If msg input is empty, emit the typed which deletes the element (broadcasted  side)
    if (e.target.value.length < 1) {
      socket.emit('userTyping', false);
      fired = false;
    } else {
      // else, emit the userTyping which displays the 'user is typing' el (ONCE)
      if (!fired) {
        socket.emit('userTyping', true);
        fired = true;
      }
    }
  }
});

// Update dom element with message
function outputMessage(user) {
  // If there are over 10 messages, display the scroll
  if (
    document.querySelector('.inner-message-container').childNodes.length > 10
  ) {
    scrollBottomBtn.classList.add('active');
  }

  const div = document.createElement('div');
  div.classList.add('message');
  // Add the username of the 'logged in' user (extracted form the URL)
  div.setAttribute(
    'id',
    username == user.username ? 'currentUser' : 'notCurrentUser'
  );
  div.innerHTML = `
  <p class="meta" style='color:hsl(${user.colorNum}, 100%, 50%)' >${user.username}</p>
  <div id="msg-body">
  <p class="text">${user.text}</p>
  <span id="msg-time"> ${user.time}</span>
  </div>
  `;

  document.querySelector('.inner-message-container').appendChild(div);
}

// Message from server
socket.on('message', (user) => {
  outputMessage(user);

  // Every time we get a message, scroll down
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// This deletes the broadcasted users 'user is typing' el
var userArr = [];
var runOnce = false;

socket.on('userTyped', (user) => {
  let index = userArr.indexOf(user);
  userArr.splice(index, 1)[0];

  // If the length of the array is 0, that means no one is typing so clear the element
  if (userArr.length < 1) {
    document.querySelector('.user-typing').innerHTML = '';
  } else {
    // Otherwise, update the element according to the arrays current state of data
    document.querySelector('.user-typing').innerHTML = `
          <p class="text isTyping">${userArr
            .map((user) => {
              return `${user} ${
                // Only include 'and' if array is larger than 2
                userArr.length > 1
                  ? userArr.indexOf(user) == userArr.length - 2
                    ? 'and '
                    : ''
                  : ''
              }`;
            })
            .join('')} ${userArr.length > 1 ? 'are' : 'is'} typing...</p>
        `;
  }
});

// This generates the 'user is typing' el
socket.on('typing', (user) => {
  // Only include unique users to the array
  if (userArr.includes(user)) {
  } else {
    userArr.push(user);
  }

  // Dynamically update the DOM as new users are added to the array
  document.querySelector('.user-typing').innerHTML = `
    <p class="text isTyping">${userArr
      .map((user) => {
        return `${user} ${
          // Only include 'and' if array is larger than 2
          userArr.length > 1
            ? userArr.indexOf(user) == userArr.length - 2
              ? 'and '
              : ''
            : ''
        }`;
      })
      .join('')} ${userArr.length > 1 ? 'are' : 'is'} typing...</p>
  `;
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
    ${users
      .map(
        (user) =>
          `<li id='${user.username == username ? 'activeUser' : ''}'>${
            user.username
          }</li>`
      )
      .join('')}
    `;
  // Because we are mapping an array, we NEED to use the .join() method
}

// Get room and users
socket.on('roomInfo', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// On initial app load, scroll to top
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  // If a user is NOT at the bottom of the messages, display the scroll to bottom button
  if (
    Math.ceil(document.body.scrollHeight - document.body.scrollTop) !==
    Math.ceil(document.body.clientHeight)
  ) {
    scrollBottomBtn.classList.add('active');
  } else {
    // else, if they are at the bottom of the messages container, hide the button
    scrollBottomBtn.classList.remove('active');
  }

  // if (
  //   document.body.scrollTop > 100 ||
  //   document.documentElement.scrollTop > 100
  // ) {
  //   scrollBottomBtn.classList.add('active');
  // } else {
  //   scrollBottomBtn.classList.remove('active');
  // }
}

function scrollBottom() {
  document.body.scrollTo({
    left: 0,
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
}
scrollBottomBtn.addEventListener('click', () => {
  scrollBottomBtn.classList.remove('active');
  scrollBottom();
});
