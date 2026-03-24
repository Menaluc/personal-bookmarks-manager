const { getAllTags } = require("../repositories/tags.repo");

function listTags() {
  return getAllTags();
}

module.exports = {
  listTags,
};
