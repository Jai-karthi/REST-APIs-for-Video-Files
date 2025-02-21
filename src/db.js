const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite'); 

async function openDB() {
    return sqlite.open({
        filename: 'database.sqlite',
        driver: sqlite3.Database,
    });
}

const dbPromise = openDB();  

async function initializeDB() {
    const db = await dbPromise;

   
    await db.exec(`
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            path TEXT
        );

        CREATE TABLE IF NOT EXISTS shares (
            token TEXT PRIMARY KEY,
            filename TEXT NOT NULL
        );
    `);
    
    console.log("Database initialized.");
}

module.exports = { dbPromise, initializeDB };
