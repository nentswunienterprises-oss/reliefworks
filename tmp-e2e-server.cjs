const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || /^\s*#/.test(line) || !line.includes("=")) {
      continue;
    }

    const [name, ...rest] = line.split("=");
    const value = rest.join("=");
    if (name && value !== undefined && !(name in process.env)) {
      process.env[name.trim()] = value.trim();
    }
  }
}

process.env.NODE_ENV = "development";
process.env.PORT = process.env.PORT || "5050";
process.env.PUBLIC_APP_ORIGIN = process.env.PUBLIC_APP_ORIGIN || `http://127.0.0.1:${process.env.PORT}`;

const mod = require("./dist/vercel-app.cjs");
const app = mod.default || mod;

app.listen(Number(process.env.PORT), "127.0.0.1", () => {
  console.log(`e2e server listening on ${process.env.PORT}`);
});
