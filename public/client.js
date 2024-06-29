const socket = io();
const usernameInput = document.getElementById('username-input');
const usernameButton = document.getElementById('username-button');
const chatContainer = document.getElementById('chat-container');
const chatInputContainer = document.getElementById('chat-input-container');
const chatSendButton = document.getElementById('send-button');
const chatInput = document.getElementById('chat-input');
const messagesList = document.getElementById('messages');

let username = localStorage.getItem('username') || '';

if (username) {
    usernameInput.value = username;
    usernameInput.disabled = true;
    usernameButton.disabled = true;
    usernameButton.style.display = 'none'
    usernameInput.style.display = 'none'
    chatContainer.style.display = 'block';
    chatInputContainer.style.display = 'flex';
    socket.emit('set username', username);
}
usernameButton.addEventListener('click', () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        socket.emit('set username', username);
        localStorage.setItem('username', username);
        usernameInput.value = '';
        usernameInput.disabled = true;
        usernameButton.disabled = true;
        chatContainer.style.display = 'block';
        chatInputContainer.style.display = 'flex';
        usernameButton.style.display = 'none'
        usernameInput.style.display = 'none'
    }
});

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