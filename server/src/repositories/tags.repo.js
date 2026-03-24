const db = require("../db/connection");

function normalizeTagName(name) {
  return name.trim().toLowerCase();
}

function getAllTags() {
  return db
    .prepare(
      `
      SELECT t.id, t.name, COUNT(bt.bookmark_id) AS count
      FROM tags t
      LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
      GROUP BY t.id, t.name
      ORDER BY t.name ASC
      `
    )
    .all();
}

function getTagByName(name) {
  return db.prepare("SELECT id, name FROM tags WHERE name = ?").get(normalizeTagName(name));
}

function insertTag(name) {
  const normalized = normalizeTagName(name);
  const result = db.prepare("INSERT INTO tags (name) VALUES (?)").run(normalized);
  return db.prepare("SELECT id, name FROM tags WHERE id = ?").get(result.lastInsertRowid);
}

function ensureTags(tagNames, externalDb = db) {
  const uniqueNormalized = [...new Set(tagNames.map((tag) => normalizeTagName(tag)).filter(Boolean))];
  if (!uniqueNormalized.length) return [];

  const insertOrIgnore = externalDb.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
  const selectByName = externalDb.prepare("SELECT id, name FROM tags WHERE name = ?");

  const tags = [];
  for (const tagName of uniqueNormalized) {
    insertOrIgnore.run(tagName);
    const tag = selectByName.get(tagName);
    if (tag) tags.push(tag);
  }
  return tags;
}

module.exports = {
  getAllTags,
  getTagByName,
  insertTag,
  ensureTags,
};
