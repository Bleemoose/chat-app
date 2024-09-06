
const sqlite3 = require('sqlite3').verbose();
// open database
let db;
//couldn't not import from auth due  to some bug i could not figure out
function User(username, password, color, id) {
    this.username = username;
    this.password = password;
    this.color = color;
    this.id = id
}

function Message(msg, sender , color ) {
    this.message = msg;
    this.sender = sender;
    this.color = color;

}



//TODO: check if the tables exist in the database then create them if not
function openDatabase(){
     db = new sqlite3.Database('project.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err && err.code === 'SQLITE_CANTOPEN') {
            db = new sqlite3.Database('project.db');
            createTables(db)
        }else if(err){
            console.error(err.message);
            return false;
        }else{
            console.log('Connected to the project database.');
        }
    });
    return true;

}

// close the database connection
function closeDatabase(){
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

//create tables
//foreign keys are disabled in SQLite and they aren't really needed in this small project
function createTables() {
    db.exec(`
    create table users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username text not null,
        password text not null,
        color text not null
    );
     create table chat_log (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_text text not null,
        message_user text not null,
        message_color text not null
        );
   
    `);


}

function writeUsers(users){
    for (let i=0; i < users.length ; i++){
        db.run(`INSERT INTO users(username, password, color) VALUES(?, ?, ?)`, [users[i].username, users[i].password, users[i].color], function(err) {
            if (err) {
                return console.error(err.message);
            }
        })
        console.log(`User ${users[i].username} has been inserted with rowid ${this.lastID}`);

    }

}

function updateUserColor(user){
    db.run(`UPDATE users SET color = ? WHERE id = ?`,[user.color,user.id] ,function (err){
        if (err) {
            return console.error(err.message);
        }
    });
    console.log(`User ${user.id}  ${user.username}  has update his color to ${user.color}`);
}

//Read users from Database
function readUsers() {


    return new Promise((resolve, reject) => {
        let users = []
        db.all(`SELECT id, username, password, color FROM users`, [], (err, rows) => {
            if (err) {
                return reject(err);
            }

            rows.forEach((row) => {
                console.log(`ID: ${row.id}, Username: ${row.username},Color: ${row.color} ,Password: ${row.password}`);
                users.push(new User(row.username, row.password, row.color ,row.id))
            });
            resolve(users)
        });


    });

}

function writeChat(chatHistory) {
    for (let i = 0; i < chatHistory.length; i++) {
         db.run(`INSERT INTO chat_log(message_text, message_user, message_color) VALUES(?, ?, ?)`, [chatHistory[i].message, chatHistory[i].sender, chatHistory[i].color], function (err) {
            if (err) {
                return console.error(err.message);
            } else {
                console.log("Chat message", chatHistory[i].message, chatHistory[i].sender, chatHistory[i].color);
            }
        })
    }

}

function readChatHistory() {


    return new Promise(async (resolve, reject) => {
        let chat = []
        await db.all(`SELECT message_id, message_text, message_user, message_color FROM chat_log`, [], (err, rows) => {
            if (err) {
                return reject(err);
            }

            rows.forEach((row) => {
                console.log(`Message: ${row.message_text},User: ${row.message_user} Color: ${row.message_color},`);
                chat.push(new Message(row.message_text, row.message_user, row.message_color))
            });
            resolve(chat)
        });


    });

}

module.exports = {
    openDatabase,
    closeDatabase,
    writeUsers,
    readUsers,
    writeChat,
    updateUserColor,
    readChatHistory
}
