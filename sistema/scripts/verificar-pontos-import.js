import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseHeaderStitches(buf) {
  const h = buf.slice(0, 512).toString('ascii');
  const i = h.indexOf('ST:');
  if (i < 0) return null;
  const n = Number.parseInt(h.slice(i + 3, i + 10).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, out);
    else if (e.name.toLowerCase().endsWith('.dst')) out.push(f);
  }
  return out;
}

const sql = fs.readFileSync(path.join(root, 'database/matrizes_import.sql'), 'utf8');
const rowRe = /\('((?:[^']|'')*)', '(\d+)', (\d+),/g;
const rows = [...sql.matchAll(rowRe)];

const files = walk(path.join(root, '_matrizes_import'));
const byName = new Map(files.map((f) => [path.basename(f, path.extname(f)), f]));

let ok = 0;
let diff = 0;
let miss = 0;
const examples = [];

for (const [, nomeRaw, , ptsSql] of rows) {
  const nome = nomeRaw.replace(/''/g, "'");
  const f = byName.get(nome);
  if (!f) {
    miss += 1;
    continue;
  }
  const hdr = parseHeaderStitches(fs.readFileSync(f));
  if (hdr === Number(ptsSql)) ok += 1;
  else {
    diff += 1;
    if (examples.length < 5) examples.push({ nome, sql: Number(ptsSql), hdr });
  }
}

console.log(JSON.stringify({ totalSql: rows.length, ok, diff, miss, examples }, null, 2));
