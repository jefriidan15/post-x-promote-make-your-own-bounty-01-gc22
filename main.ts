// Entry for make.fun race post-x-promote-make-your-own-bounty-01
// (golden-condor-22). The entry itself is one post on X quoting
// make.fun's make-your-own-bounty post; this script only carries the
// post's address from POST.json into the harness output directory.
//
// Reads POST.json from MAKEFUN_BOT_DIR (default /bot), validates that it
// is a JSON object with a `url` string of the form
// https://x.com/<handle>/status/<digits>, then copies it byte-identical
// to MAKEFUN_OUTPUT_DIR (default /output)/POST.json.
//
// Node 22, standard library only. No network, no secrets.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const POST_URL_RE = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;

function fail(message) {
  console.error(`main.ts: ERROR: ${message}`);
  process.exit(1);
}

const sourcePath = join(BOT_DIR, "POST.json");

let raw;
try {
  raw = readFileSync(sourcePath);
} catch (err) {
  fail(`cannot read ${sourcePath}: ${err.message}`);
}

let parsed;
try {
  parsed = JSON.parse(raw.toString("utf8"));
} catch (err) {
  fail(`${sourcePath} is not valid JSON: ${err.message}`);
}

if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
  fail(`${sourcePath} must be a JSON object with a "url" string`);
}

if (typeof parsed.url !== "string" || !POST_URL_RE.test(parsed.url)) {
  fail(
    `${sourcePath} "url" must match https://x.com/<handle>/status/<digits>, ` +
      `got: ${JSON.stringify(parsed.url)}`
  );
}

// POST_URL_RE already validated the shape, so this match cannot fail.
const [, handle, statusId] = parsed.url.match(
  /^https:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/(\d+)$/
);

mkdirSync(OUTPUT_DIR, { recursive: true });
const destPath = join(OUTPUT_DIR, "POST.json");
writeFileSync(destPath, raw);

console.log(`main.ts: copied ${sourcePath} -> ${destPath}`);
console.log(`main.ts: post url: ${parsed.url}`);
console.log(`main.ts: post by @${handle}, status ${statusId}`);
console.log(`main.ts: ${raw.length} bytes, byte-identical copy`);
