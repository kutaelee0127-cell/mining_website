import fs from 'node:fs';

// Usage: node scripts/contract/write_summary_json.mjs <outPath> <jsonString>
const [outPath, jsonString] = process.argv.slice(2);
if (!outPath || !jsonString) {
  console.error('usage: write_summary_json.mjs <outPath> <jsonString>');
  process.exit(2);
}

let obj;
try {
  obj = JSON.parse(jsonString);
} catch (e) {
  console.error('invalid jsonString');
  process.exit(2);
}

fs.writeFileSync(outPath, JSON.stringify(obj, null, 2) + '\n');
