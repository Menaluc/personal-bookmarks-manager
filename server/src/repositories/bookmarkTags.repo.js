const db = require("../db/connection");

function replaceBookmarkTags(bookmarkId, tagIds, externalDb = db) {
  externalDb.prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?").run(bookmarkId);
  if (!tagIds.length) return;

  const insert = externalDb.prepare(
    "INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)"
  );
  for (const tagId of tagIds) {
    insert.run(bookmarkId, tagId);
  }
}

function getTagsForBookmark(bookmarkId) {
  return db
    .prepare(
      `
      SELECT t.id, t.name
      FROM tags t
      INNER JOIN bookmark_tags bt ON bt.tag_id = t.id
      WHERE bt.bookmark_id = ?
      ORDER BY t.name ASC
      `
    )
    .all(bookmarkId);
}

module.exports = {
  replaceBookmarkTags,
  getTagsForBookmark,
};
