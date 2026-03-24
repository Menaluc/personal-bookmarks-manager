const express = require("express");
const {
  listBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} = require("../controllers/bookmarks.controller");

const router = express.Router();

router.get("/", listBookmarks);
router.post("/", createBookmark);
router.put("/:id", updateBookmark);
router.delete("/:id", deleteBookmark);

module.exports = router;
