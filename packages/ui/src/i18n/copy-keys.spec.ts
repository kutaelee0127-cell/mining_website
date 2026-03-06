import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type LocaleMap = Record<string, string>;

const ROOT = resolve(__dirname, "../../../..");
const COPY_SSOT_PATH = resolve(ROOT, "docs/ui/COPY_KEYS_SSOT.md");
const KO_PATH = resolve(__dirname, "./locales/ko-KR.json");
const EN_PATH = resolve(__dirname, "./locales/en-US.json");

const REQUIRED_PREFIXES = [
  "app.",
  "nav.",
  "action.",
  "msg.",
  "err.",
  "field.",
  "status.",
  "about.",
  "admin.",
];

function extractRequiredKeys(markdown: string): string[] {
  const keys = new Set<string>();
  const lines = markdown.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.includes("|---")) {
      continue;
    }

    const cells = trimmed.split("|").map((cell) => cell.trim()).filter(Boolean);
    if (cells.length === 0 || cells[0] === "key") {
      continue;
    }

    const key = cells[0];
    if (REQUIRED_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      keys.add(key);
    }
  }

  return Array.from(keys).sort();
}

function assertCoverage(keys: string[], locale: LocaleMap, name: string): void {
  const missing = keys.filter((key) => !(key in locale));
  if (missing.length > 0) {
    throw new Error(`${name} missing keys: ${missing.join(", ")}`);
  }
}

const ssot = readFileSync(COPY_SSOT_PATH, "utf-8");
const keys = extractRequiredKeys(ssot);
const ko = JSON.parse(readFileSync(KO_PATH, "utf-8")) as LocaleMap;
const en = JSON.parse(readFileSync(EN_PATH, "utf-8")) as LocaleMap;

assertCoverage(keys, ko, "ko-KR");
assertCoverage(keys, en, "en-US");
