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
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            filename TEXT NOT NULL,
            expiration_time INTEGER NOT NULL
        );
    `);

    console.log("Database initialized.");
}


async function updateDatabaseSchema() {
    const db = await dbPromise;

    
    const columns = await db.all(`PRAGMA table_info(shares)`);
    const hasExpirationTime = columns.some(col => col.name === 'expiration_time');

    if (!hasExpirationTime) {
        console.log("Updating shares table to add expiration_time column...");
        await db.exec(`ALTER TABLE shares ADD COLUMN expiration_time INTEGER NOT NULL DEFAULT 0;`);
    }
}

module.exports = { dbPromise, initializeDB, updateDatabaseSchema };
