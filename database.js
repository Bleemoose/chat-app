
const sqlite3 = require('sqlite3').verbose();
// open database
let db;
//couldn't not import from auth due  to some bug i could not figure out
function User(username, password, color) {
    this.username = username;
    this.password = password;
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
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username text not null,
        password text not null,
        color text not null
    );
     create table chat_log (
        message_id int primary key not null,
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
//TODO fix problem with async calls all over the auth
async function readUsers() {
    let users = []
    await db.all(`SELECT user_id, username, password, color FROM users`, [], (err, rows) => {
        if (err) {
            throw err;
        }

        rows.forEach((row) => {
            console.log(`ID: ${row.user_id}, Username: ${row.username},Color: ${row.color} ,Password: ${row.password}`);
            users.push(new User(row.username, row.password, row.color))
        });

    });
    return users;

}

module.exports = {
    openDatabase,
    closeDatabase,
    writeUsers,
    readUsers
}
