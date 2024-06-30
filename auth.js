const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs")

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
            return {};
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
    let newUser = new User(username, password, 'black');
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

module.exports = {
    registerUser,
    authenticateUser
};