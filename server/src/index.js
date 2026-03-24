const app = require("./app");
const { PORT } = require("./config/env");
const { initializeSchema } = require("./db/schema");
const { seedDefaults } = require("./db/seed");

initializeSchema();
seedDefaults();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
