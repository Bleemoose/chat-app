const socket = io();
const usernameInput = document.getElementById('username-input');
const usernameButton = document.getElementById('username-button');
const chatContainer = document.getElementById('chat-container');
const chatInputContainer = document.getElementById('chat-input-container');
const chatSendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');
const messagesList = document.getElementById('messages');
const setColorButton  = document.getElementById('set-color-button');
const colorPicker = document.getElementById('color-picker');

//TODO: Clean up :')
let username = '';
let user;

socket.on('no user' , (ye => {
    console.log('no user');
    window.location.reload()
}))

usernameInput.disabled = true;
usernameButton.disabled = true;
usernameButton.style.display = 'none'
usernameInput.style.display = 'none'
chatContainer.style.display = 'block';
chatInputContainer.style.display = 'flex';

if (username) {
    usernameInput.value = username;
    socket.emit('set username', username);
}
usernameButton.addEventListener('click', () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        socket.emit('set username', username);
        usernameInput.value = '';
        usernameInput.disabled = true;
        usernameButton.disabled = true;
        chatContainer.style.display = 'block';
        chatInputContainer.style.display = 'flex';
        usernameButton.style.display = 'none'
        usernameInput.style.display = 'none'
    }
});



setColorButton.addEventListener('click', () =>{
    console.log(colorPicker.value);
    socket.emit('change color' , colorPicker.value);
})


socket.on('user set', (user) => {
    //TODO: Now that we have the user object from backend we need to just make the client use it so jsut redo client :D
    user = user;
    colorPicker.value = user.color;
})

// Receive the chat history from the server
socket.on('chat history', (history) => {
    history.forEach((message) => {
        console.log(message);

        displayMessage(message.message, message.sender, message.color);
    });
});

// Handle new chat messages
socket.on('chat message', (msg) => {
    displayMessage(msg.message, msg.sender, msg.color);
});



chatInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});



chatSendButton.addEventListener('click', () => {
    sendMessage();
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chat message', message);
        chatInput.value = '';
    }
}

function displayMessage(message, sender, color) {
    let li = document.createElement('li');
    console.log(color)
    li.style.color = `${color}`
    li.textContent = `${sender}: ${message}`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
}