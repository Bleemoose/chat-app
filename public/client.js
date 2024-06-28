const socket = io();
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const messagesList = document.getElementById('messages');


// Receive the chat history from the server
socket.on('chat history', (history) => {
    history.forEach((message) => {
        displayMessage(message.message, message.sender);
    });
});

// Handle new chat messages
socket.on('chat message', (msg , sender) => {
    displayMessage(msg, sender);
});

chatInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

sendButton.addEventListener('click', () => {
    sendMessage();
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chat message', message);
        chatInput.value = '';
    }
}

function displayMessage(message, sender) {
    console.log(message)
    const li = document.createElement('li');
    li.textContent = `${sender}: ${message}`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
}