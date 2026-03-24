const db = require("./connection");

function seedDefaults() {
  // Keep startup deterministic; add default rows only when absent.
  const count = db.prepare("SELECT COUNT(*) AS count FROM tags").get().count;
  if (count > 0) return;

  const defaults = ["work", "learning", "reading"];
  const insert = db.prepare("INSERT INTO tags (name) VALUES (?)");
  const transaction = db.transaction((names) => {
    for (const name of names) {
      insert.run(name);
    }
  });
  transaction(defaults);
}

module.exports = {
  seedDefaults,
};
