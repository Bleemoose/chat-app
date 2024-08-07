const sqlite3 = require('sqlite3').verbose();

// open database

function openDatabase(){
    let db = new sqlite3.Database('project.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err && err.code === 'SQLITE_CANTOPEN') {
            db = new sqlite3.Database('project.db');
        }else if(err){
            console.error(err.message);
            return null;
        }else{
            console.log('Connected to the project database.');
        }
    });
    return db;

}

// close the database connection
function closeDatabase(db){
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

module.exports = {
    openDatabase,
    closeDatabase
}
