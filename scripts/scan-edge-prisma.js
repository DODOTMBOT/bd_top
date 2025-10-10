const { globbySync } = require("globby");
const fs = require("fs");

const files = globbySync(["app/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"]);
let bad = [];

for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  if (s.includes("@prisma/client") || s.includes("bcrypt")) {
    if (s.includes('export const runtime = "edge"') || s.includes("runtime='edge'")) {
      bad.push(f);
    }
  }
}

if (bad.length) {
  console.error("❌ Edge runtime запрещён с Prisma/bcrypt:\n" + bad.join("\n"));
  process.exit(1);
}

console.log("✅ OK: нет Edge с Prisma/bcrypt");
