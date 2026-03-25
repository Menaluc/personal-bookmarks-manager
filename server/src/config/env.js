const path = require("path");

const PORT = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === "production";
// DB_FILE_PATH overrides all. Otherwise: Railway/production uses /data; local dev uses server/data.
const DB_FILE_PATH =
  process.env.DB_FILE_PATH ||
  (isProduction
    ? "/data/bookmarks.db"
    : path.join(__dirname, "../../data/bookmarks.db"));

module.exports = {
  PORT,
  DB_FILE_PATH,
};
