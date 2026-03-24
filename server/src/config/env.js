const path = require("path");

const PORT = Number(process.env.PORT || 4000);
const DB_FILE_PATH =
  process.env.DB_FILE_PATH || path.join(__dirname, "../../data/bookmarks.db");

module.exports = {
  PORT,
  DB_FILE_PATH,
};
