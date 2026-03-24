const { listTags } = require("../services/tags.service");

async function getTags(_req, res, next) {
  try {
    const tags = listTags();
    res.json(tags);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTags,
};
