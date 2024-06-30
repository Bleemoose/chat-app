const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { registerUser, authenticateUser } = require('./auth');

function getRandomColor() {
    const colorList = ['Aqua','Aquamarine','Black','BlueViolet','Chocolate','Crimson','Orange'];
    return colorList[Math.floor(Math.random() * colorList.length)];
}

// Variable to store chat messages
let chatHistory = [];

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


//Main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
//Login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});
// Handle user registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (registerUser(username, password)) {
        res.status(200).send('Registration successful');
    } else {
        res.status(400).send('Username already exists');
    }
});

// Handle user authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (authenticateUser(username, password)) {
        res.status(200).redirect('/')
    } else {
        res.status(401).send('Invalid username or password');
    }
});


// Handle incoming socket.io connections
io.on('connection', (socket) => {

    // Handle username setting
    socket.on('set username', (username) => {
        if (username !== socket.username){
            //get random colour
            socket.color = getRandomColor();
        }
        socket.username = username;
        console.log(`User ${username} connected`);
        socket.emit('chat history', chatHistory);

    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        chatHistory.push({ message: msg, sender: socket.username, color: socket.color });
        io.emit('chat message', { message: msg, sender: socket.username, color: socket.color });
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