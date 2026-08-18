/**
 * Extrai nome e quantidade de pontos de arquivos .DST (Tajima).
 * Uso: node scripts/extrair-matrizes-dst.js <pasta> [saida.csv]
 */
import fs from 'fs';
import path from 'path';

function decodeDstDelta(b0, b1, b2) {
  let x = 0;
  let y = 0;

  if (b2 & 0x01) x += 1;
  if (b2 & 0x02) x -= 1;
  if (b2 & 0x04) x += 9;
  if (b2 & 0x08) x -= 9;
  if (b2 & 0x80) y += 1;
  if (b2 & 0x40) y -= 1;
  if (b2 & 0x20) y += 9;
  if (b2 & 0x10) y -= 9;

  if (b1 & 0x01) x += 3;
  if (b1 & 0x02) x -= 3;
  if (b1 & 0x04) x += 27;
  if (b1 & 0x08) x -= 27;
  if (b1 & 0x80) y += 3;
  if (b1 & 0x40) y -= 3;
  if (b1 & 0x20) y += 27;
  if (b1 & 0x10) y -= 27;

  if (b0 & 0x01) x += 81;
  if (b0 & 0x02) x -= 81;
  if (b0 & 0x04) x += 243;
  if (b0 & 0x08) x -= 243;
  if (b0 & 0x80) y += 81;
  if (b0 & 0x40) y -= 81;
  if (b0 & 0x20) y += 243;
  if (b0 & 0x10) y -= 243;

  return { x, y };
}

function parseHeaderStitchCount(buffer) {
  const header = buffer.slice(0, 512).toString('ascii');
  const idx = header.indexOf('ST:');
  if (idx < 0) return null;
  const value = Number.parseInt(header.slice(idx + 3, idx + 10).trim(), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function countDstStitches(buffer) {
  const fromHeader = parseHeaderStitchCount(buffer);
  if (fromHeader != null) return fromHeader;

  let stitches = 0;
  let i = 512;

  while (i + 2 < buffer.length) {
    const b0 = buffer[i];
    const b1 = buffer[i + 1];
    const b2 = buffer[i + 2];
    i += 3;

    if (b0 === 0 && b1 === 0 && b2 === 0xf3) break;

    const { x, y } = decodeDstDelta(b0, b1, b2);
    const isJump = (b2 & 0x83) === 0x83;
    const isColorChange = (b2 & 0xc3) === 0xc3;
    const isSequin = (b0 & 0x0f) === 0x0f;

    if (isColorChange || isSequin) continue;
    if (isJump) continue;
    if (x !== 0 || y !== 0) stitches += 1;
  }

  return stitches;
}

function walkDir(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, out);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.dst')) out.push(full);
  }
  return out;
}

function csvEscape(value) {
  const s = String(value);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const inputDir = process.argv[2];
const outputFile = process.argv[3] ?? path.join(inputDir, 'matrizes_extraidas.csv');

if (!inputDir || !fs.existsSync(inputDir)) {
  console.error('Uso: node scripts/extrair-matrizes-dst.js <pasta> [saida.csv]');
  process.exit(1);
}

const files = walkDir(inputDir).sort((a, b) => a.localeCompare(b, 'pt-BR'));
const rows = [['nome', 'qtd_pontos', 'arquivo', 'pasta']];
const errors = [];

for (const file of files) {
  try {
    const buffer = fs.readFileSync(file);
    const nome = path.basename(file, path.extname(file));
    const pontos = countDstStitches(buffer);
    const pasta = path.basename(path.dirname(file));
    rows.push([nome, String(pontos), path.basename(file), pasta]);
  } catch (err) {
    errors.push({ file, error: err.message });
  }
}

const csv = rows.map((r) => r.map(csvEscape).join(';')).join('\n');
fs.writeFileSync(outputFile, `\uFEFF${csv}`, 'utf8');

console.log(`Arquivos .DST: ${files.length}`);
console.log(`Exportado: ${outputFile}`);
if (errors.length) {
  console.log(`Erros: ${errors.length}`);
  for (const e of errors.slice(0, 10)) console.log(`  - ${e.file}: ${e.error}`);
}
