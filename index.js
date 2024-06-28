const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Variable to store chat messages
let chatHistory = [];

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// Handle incoming socket.io connections
io.on('connection', (socket) => {

    // Handle username setting
    socket.on('set username', (username) => {
        socket.username = username;
        console.log(`User ${username} connected`);
        socket.emit('chat history', chatHistory);
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        chatHistory.push({ message: msg, sender: socket.username });
        io.emit('chat message', { message: msg, sender: socket.username });
    });


    // Handle username setting
    socket.on('set username', (username) => {
        socket.username = username;
        console.log(`User ${username} connected`);
        socket.emit('chat history', chatHistory);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
http.listen(3000, () => {
    console.log('Server is running on port 3000');
});