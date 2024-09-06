const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const {openDatabase,closeDatabase,writeUsers, readUsers, updateUserColor} = require('./database');

const usersFilePath = path.join(__dirname, 'users.json');

/*TODO: make sure this doesnt cause any problems down the line cause i used to read
in every function before implementing the database*/
let users = []

//Constructor for user
function User(username, password, color, dbID) {
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

async function loadUsers() {
    try {
        //const usersData = fs.readFileSync(usersFilePath, 'utf8');
        //return JSON.parse(usersData);
        let loadedUsersFromDB = await readUsers();
        console.log(loadedUsersFromDB);
        users = loadedUsersFromDB
        return loadedUsersFromDB;
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
        writeUsers(users)
    } catch (err) {
        console.error('Error saving users:', err);
    }
}

async function registerUser(username, password) {
    //const users = await loadUsers();
    if (findUser(username,users) !=null) {
        return false; // Username already exists
    }
    let hashedPassword = await bcrypt.hash(password, 8)
    let newUser = new User(username, hashedPassword, 'black');
    users.push(newUser)
    saveUsers(users);
    return true;
}

function updateColor(user,color){
   //let users =  loadUsers()
    let userIndex = findUser(user.username , users)
    if (userIndex != null){
        users[userIndex].color = color;
        updateUserColor(users[userIndex]);
        return true;
    }
    return false;
}


//TODO we dont really need to load all the users need to just look into the DB to authenticate the user
function authenticateUser(username, password) {
    //const users = loadUsers();
    if (findUser(username, users)  != null) {
        if (bcrypt.compare(password, users[findUser(username,users)].password)){
            return users[findUser(username,users)];
        }else{
            return false;
        }
    }
    return false;

}


function verifyToken(req, res, next) {
    let token;
    for (let i = 0 ; i < req.rawHeaders.length ; i++){
        if (req.rawHeaders[i].includes('token=')){
            //console.log(req.rawHeaders[i]);
            token = req.rawHeaders[i].slice(6)
        }
    }
    if (!token){
        return res.redirect('/login');
    }
    try {
        //let users = loadUsers()
        const decoded = jwt.verify(token, 'your-secret-key');

        userIndex = findUser(decoded.username, users)
        if ( userIndex != null){
            req.user = users[userIndex];

            next();
        }else{
            throw 'Unauthorized';
        }

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    registerUser,
    authenticateUser,
    verifyToken,
    updateColor,
    users,
    loadUsers
};