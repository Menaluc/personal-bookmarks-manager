const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// From server/scripts, go up to project root.
const rootDir = path.resolve(__dirname, "../..");
const clientDir = path.join(rootDir, "client");
const clientDistDir = path.join(clientDir, "dist");
const serverPublicDir = path.join(rootDir, "server", "public");

// Run a shell command in a specific directory and stream output.
function run(command, cwd) {
  execSync(command, {
    cwd,
    stdio: "inherit",
  });
}

// Remove a directory if it exists, then create it again.
function resetDirectory(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

// Copy all files and folders recursively from source to destination.
function copyDirectoryRecursive(sourceDir, destinationDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copyDirectoryRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function main() {
  console.log("Installing client dependencies...");
  run("npm install", clientDir);

  console.log("Building client...");
  run("npm run build", clientDir);

  if (!fs.existsSync(clientDistDir)) {
    throw new Error("Build output not found: client/dist");
  }

  console.log("Preparing server/public...");
  resetDirectory(serverPublicDir);

  console.log("Copying client/dist -> server/public...");
  copyDirectoryRecursive(clientDistDir, serverPublicDir);

  console.log("Done: server/public is ready.");
}

try {
  main();
} catch (error) {
  console.error("build-client failed.");
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}