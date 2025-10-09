require('dotenv').config();
const url = process.env.DATABASE_URL ?? "";
const ok = /^postgres(ql)?:\/\/.+/.test(url);
if (!ok) {
  console.error("Invalid DATABASE_URL. It must start with postgresql:// or postgres://");
  console.error("Current length:", url.length);
  process.exit(1);
}
console.log("DATABASE_URL looks valid.");
