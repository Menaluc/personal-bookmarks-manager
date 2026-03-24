const {
  listBookmarksService,
  createBookmarkService,
  updateBookmarkService,
  deleteBookmarkService,
} = require("../services/bookmarks.service");

async function listBookmarks(req, res, next) {
  try {
    const bookmarks = listBookmarksService(req.query);
    res.json(bookmarks);
  } catch (error) {
    next(error);
  }
}

async function createBookmark(req, res, next) {
  try {
    const bookmark = await createBookmarkService(req.body);
    res.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
}

async function updateBookmark(req, res, next) {
  try {
    const bookmark = await updateBookmarkService(req.params.id, req.body);
    res.json(bookmark);
  } catch (error) {
    next(error);
  }
}

async function deleteBookmark(req, res, next) {
  try {
    deleteBookmarkService(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};
