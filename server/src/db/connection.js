const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { DB_FILE_PATH } = require("../config/env");

const dbDirectory = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new Database(DB_FILE_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

module.exports = db;
