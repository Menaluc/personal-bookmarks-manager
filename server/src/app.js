const express = require("express");
const cors = require("cors");
const bookmarksRoutes = require("./routes/bookmarks.routes");
const tagsRoutes = require("./routes/tags.routes");
const { notFoundHandler } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/tags", tagsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
