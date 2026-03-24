const db = require("../db/connection");
const {
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarkById,
  getBookmarkByUrl,
  listBookmarks,
} = require("../repositories/bookmarks.repo");
const { replaceBookmarkTags } = require("../repositories/bookmarkTags.repo");
const { ensureTags } = require("../repositories/tags.repo");
const { fetchBookmarkMetadata } = require("./metadata.service");
const { normalizeUrl } = require("../utils/url");
const { badRequest, conflict, notFound } = require("../utils/httpErrors");

function normalizeTagInput(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

function listBookmarksService(query) {
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const tag = typeof query.tag === "string" ? query.tag.trim() : "";
  return listBookmarks({ search, tag });
}

async function createBookmarkService(payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body is required.");
  }

  const normalizedUrl = normalizeUrl(payload.url);
  const tagNames = normalizeTagInput(payload.tags);

  if (getBookmarkByUrl(normalizedUrl)) {
    throw conflict("Bookmark already exists for this URL.");
  }

  const metadata = await fetchBookmarkMetadata(normalizedUrl);
  const finalUrl = normalizeUrl(metadata.resolvedUrl || normalizedUrl);

  if (finalUrl !== normalizedUrl && getBookmarkByUrl(finalUrl)) {
    throw conflict("Bookmark already exists for the resolved URL.");
  }

  const transaction = db.transaction(() => {
    const bookmark = createBookmark({
      url: finalUrl,
      title: metadata.title || finalUrl,
      description: metadata.description || "",
      favicon: metadata.favicon || "",
    }, db);

    const tags = ensureTags(tagNames, db);
    replaceBookmarkTags(
      bookmark.id,
      tags.map((tag) => tag.id),
      db
    );

    return {
      ...bookmark,
      tags: tags.map((tag) => tag.name),
    };
  });

  return transaction();
}

async function updateBookmarkService(id, payload) {
  const bookmarkId = Number(id);
  if (!Number.isInteger(bookmarkId) || bookmarkId <= 0) {
    throw badRequest("Invalid bookmark id.");
  }
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body is required.");
  }

  const existing = getBookmarkById(bookmarkId);
  if (!existing) throw notFound("Bookmark not found.");

  const normalizedUrl = normalizeUrl(payload.url || existing.url);
  const title = typeof payload.title === "string" ? payload.title.trim() : existing.title;
  const description =
    typeof payload.description === "string" ? payload.description.trim() : existing.description;
  const favicon = typeof payload.favicon === "string" ? payload.favicon.trim() : existing.favicon;
  const tagNames = normalizeTagInput(payload.tags);

  const duplicate = getBookmarkByUrl(normalizedUrl);
  if (duplicate && duplicate.id !== bookmarkId) {
    throw conflict("Another bookmark already uses this URL.");
  }

  const transaction = db.transaction(() => {
    const updated = updateBookmark(
      bookmarkId,
      {
        url: normalizedUrl,
        title: title || normalizedUrl,
        description: description || "",
        favicon: favicon || "",
      },
      db
    );
    const tags = ensureTags(tagNames, db);
    replaceBookmarkTags(
      bookmarkId,
      tags.map((tag) => tag.id),
      db
    );

    return {
      ...updated,
      tags: tags.map((tag) => tag.name),
    };
  });

  return transaction();
}

function deleteBookmarkService(id) {
  const bookmarkId = Number(id);
  if (!Number.isInteger(bookmarkId) || bookmarkId <= 0) {
    throw badRequest("Invalid bookmark id.");
  }

  const result = deleteBookmark(bookmarkId);
  if (!result.changes) throw notFound("Bookmark not found.");
}

module.exports = {
  listBookmarksService,
  createBookmarkService,
  updateBookmarkService,
  deleteBookmarkService,
};
