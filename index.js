const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { registerUser, authenticateUser, verifyToken, updateColor, loadUsers} = require('./auth');
const jwt = require("jsonwebtoken");
const {openDatabase,closeDatabase, writeChat, readChatHistory} = require('./database');


//TODO: Clean up old functions
function getRandomColor() {
    const colorList = ['Aqua','Aquamarine','Black','BlueViolet','Chocolate','Crimson','Orange'];
    return colorList[Math.floor(Math.random() * colorList.length)];
}





// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


//establish database 'connection' and load the users
let chatHistory = [];
if (openDatabase()){
    console.log("Database opened successfully")
    loadUsers()
    readChatHistory().then(result => {
       chatHistory = result;
       lastSavedChatIndex = result.length;
    })
}else{
    console.log("Database problem :(")
}

// Variable to store chat messages

let lastSavedChatIndex = chatHistory.length;
let user;

//Main page
app.get('/', verifyToken ,(req, res) => {
    user = req.user;

    res.sendFile(__dirname + '/public/chat.html');
});
//Login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});
// Handle user registration
app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    if (await registerUser(username, password)) {
        console.log(registerUser(username, password))
        res.status(200).redirect('/login');
    } else {
        res.status(400).send('Username already exists');
    }
});

// Handle user authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (authenticateUser(username, password)) {
        const token = jwt.sign({ username: username }, 'your-secret-key', {
            expiresIn: '1h',
        });
        res.cookie('token' , token);
        res.status(200).redirect('/');
    } else {
        res.status(401).send('Invalid username or password');
    }
});




io.on('connection', (socket) => {
    //socket connects without making a  get request thus skipping the authentication and all getting the user data
    if (!user){
        console.log('no user detected due to refresh and socket insta connection forcing refresh')
        socket.emit('no user' , user);
        return;
    }
    console.log(`User ${user.username} connected`);
    // send user data to fronted
    socket.user = user
    socket.emit('user set', user)
    //send chat history
    socket.emit('chat history', chatHistory);


    // Handle username setting
    socket.on('set username', (username) => {
        if (username !== socket.username){
            //get random colour
            socket.color = getRandomColor();
        }
        socket.username = username;



    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        console.log(`${socket.user.username}: ` + msg);
        chatHistory.push({ message: msg, sender: socket.user.username, color: socket.user.color });
        io.emit('chat message', { message: msg, sender: socket.user.username, color: socket.user.color });
    });



    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`${socket.user.username} disconnected`);
    });

    // Handle change color
    socket.on('change color', (colorValue)=>{
       socket.user.color = colorValue;
       updateColor(socket.user, colorValue)
    });
});

setInterval(function(){
    console.log("saving chat")

    if (chatHistory.length == 0){
        return
    }
    let chatToBeSaved = chatHistory
    for (let i = 0; i < lastSavedChatIndex; i++){
        chatToBeSaved.shift()
    }
    lastSavedChatIndex = chatHistory.length;

    //console.log(chatToBeSaved)
    writeChat(chatToBeSaved);
},16000 ) //logs hi every second

// Start the server
http.listen(3000, () => {
    console.log('Server is running on port 3000');
});





//These dont work for some reason

/*
http.on('close', () => {
    writeChat(chatHistory);
});

process.on('SIGINT', () => {
    writeChat(chatHistory).then(r => console.log("HI"));
    closeDatabase()
    http.close();
    process.exit();
});
 */