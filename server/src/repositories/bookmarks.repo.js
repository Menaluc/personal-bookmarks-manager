const db = require("../db/connection");

function createBookmark({ url, title, description, favicon }, externalDb = db) {
  const result = externalDb
    .prepare(
      "INSERT INTO bookmarks (url, title, description, favicon) VALUES (?, ?, ?, ?)"
    )
    .run(url, title, description, favicon);

  return externalDb
    .prepare("SELECT id, url, title, description, favicon, created_at FROM bookmarks WHERE id = ?")
    .get(result.lastInsertRowid);
}

function updateBookmark(id, { url, title, description, favicon }, externalDb = db) {
  externalDb
    .prepare(
      `
      UPDATE bookmarks
      SET url = ?, title = ?, description = ?, favicon = ?
      WHERE id = ?
      `
    )
    .run(url, title, description, favicon, id);

  return getBookmarkById(id, externalDb);
}

function deleteBookmark(id) {
  return db.prepare("DELETE FROM bookmarks WHERE id = ?").run(id);
}

function getBookmarkById(id, externalDb = db) {
  return externalDb
    .prepare("SELECT id, url, title, description, favicon, created_at FROM bookmarks WHERE id = ?")
    .get(id);
}

function getBookmarkByUrl(url) {
  return db
    .prepare("SELECT id, url, title, description, favicon, created_at FROM bookmarks WHERE url = ?")
    .get(url);
}

function listBookmarks({ search, tag }) {
  const whereParts = [];
  const params = {};

  if (search) {
    whereParts.push("(b.title LIKE @search OR b.description LIKE @search OR b.url LIKE @search)");
    params.search = `%${search}%`;
  }

  if (tag) {
    whereParts.push("EXISTS (SELECT 1 FROM bookmark_tags bt2 JOIN tags t2 ON t2.id = bt2.tag_id WHERE bt2.bookmark_id = b.id AND t2.name = @tag)");
    params.tag = tag.trim().toLowerCase();
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const sql = `
    SELECT
      b.id,
      b.url,
      b.title,
      b.description,
      b.favicon,
      b.created_at,
      COALESCE(
        (
          SELECT json_group_array(t.name)
          FROM (
            SELECT t.name
            FROM bookmark_tags bt
            JOIN tags t ON t.id = bt.tag_id
            WHERE bt.bookmark_id = b.id
            ORDER BY t.name ASC
          ) t
        ),
        '[]'
      ) AS tags
    FROM bookmarks b
    ${whereClause}
    ORDER BY b.created_at DESC, b.id DESC
  `;

  const rows = db.prepare(sql).all(params);
  return rows.map((row) => ({
    ...row,
    tags: JSON.parse(row.tags || "[]"),
  }));
}

module.exports = {
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarkById,
  getBookmarkByUrl,
  listBookmarks,
};
