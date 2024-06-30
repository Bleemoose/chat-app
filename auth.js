const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

const usersFilePath = path.join(__dirname, 'users.json');


//Constructor for user
function User(username, password, color) {
    this.username = username;
    this.password = password;
    this.color = color;
}

//helper function
function findUser(username, users){
    for (let i = 0 ; i < users.length ; i++){
        //null check i am not sure if needed
        if (users[i]){
            if (users[i].username === username){
                return i;
            }
        }

    }
    return null;
}

function loadUsers() {
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(usersData);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File doesn't exist, create a new one
            saveUsers([]);
            return [];
        } else {
            console.error('Error loading users:', err);
            return [];
        }
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error saving users:', err);
    }
}

async function registerUser(username, password) {
    const users = loadUsers();
    if (users[username]) {
        return false; // Username already exists
    }
    let hashedPassword = await bcrypt.hash(password, 8)
    let newUser = new User(username, hashedPassword, 'black');
    console.log(typeof users);
    users.push(newUser)
    saveUsers(users);
    return true;
}

function authenticateUser(username, password) {
    const users = loadUsers();
    if (bcrypt.compare(password, users[findUser(username,users)].password)){
        return users[findUser(username,users)];
    }else{
        return false;
    }
}


function verifyToken(req, res, next) {
    let token;
    for (let i = 0 ; i < req.rawHeaders.length ; i++){
        if (req.rawHeaders[i].includes('token=')){
            console.log(req.rawHeaders[i]);
            token = req.rawHeaders[i].slice(6)
        }
    }
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.username = decoded.username;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    registerUser,
    authenticateUser,
    verifyToken
};