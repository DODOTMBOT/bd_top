const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Используем find вместо globby для совместимости
const files = execSync("find app components -name '*.ts' -o -name '*.tsx'", { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(f => f);

const banned = [/from ["']@nextui-org\//, /from ["']@shadcn\//, /from ["']@radix-ui\//, /from ["']@headlessui\//];
let bad = [];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  if (banned.some((r) => r.test(s))) bad.push(f);
}
if (bad.length) {
  console.error("\n❌ Найдены запрещённые импорты UI:\n" + bad.map((f) => " - " + f).join("\n"));
  process.exit(1);
} else {
  console.log("✅ HeroUI imports only — OK");
}
