const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const sourceBytes = fs.readFileSync(path.join(root, 'docs', 'case-data.json'));
const sourceHash = crypto.createHash('sha256').update(sourceBytes).digest('hex');
const source = JSON.parse(sourceBytes);
const translated = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'gu-guidance.json')));
if (translated.sourceHash !== sourceHash) throw new Error('Gujarati guidance is out of date with the source');
if (Object.keys(translated.entries).length !== source.steps.length) throw new Error('Gujarati guidance entry count differs from the source');

const missing = [];
const noGujarati = [];
const missingNumbers = [];
const missingMetadata = [];
const digits = text => String(text).replace(/[૦-૯]/g, character => '૦૧૨૩૪૫૬૭૮૯'.indexOf(character));
const check = (item, field, english) => {
  if (typeof english !== 'string' || !english.trim()) return;
  const gujarati = translated.entries[item.id]?.[field];
  if (typeof gujarati !== 'string' || !gujarati.trim()) { missing.push(`${item.id}::${field}`); return; }
  if (english.length > 30 && !/[\u0A80-\u0AFF]/.test(gujarati)) noGujarati.push(`${item.id}::${field}`);
  const originalNumbers = new Set(digits(english).match(/\d+/g) || []);
  const translatedNumbers = new Set(digits(gujarati).match(/\d+/g) || []);
  const lost = [...originalNumbers].filter(number => !translatedNumbers.has(number));
  if (lost.length) missingNumbers.push({ id: item.id, field, numbers: lost });
};
for (const item of source.steps) {
  for (const field of ['title', 'text', 'case_action', 'triage_why', 'deadline', 'applies_when', 'note', 'statutory_character']) check(item, field, item[field]);
  (item.ticks || []).forEach((tick, index) => {
    check(item, `ticks.${index}.do`, tick.do);
    (tick.sub || []).forEach((sub, subIndex) => check(item, `ticks.${index}.sub.${subIndex}`, sub));
  });
  (item.details || []).forEach((detail, index) => check(item, `details.${index}.text`, detail.text));
  (item.conflicts || []).forEach((conflict, index) => { if (typeof conflict === 'string') check(item, `conflicts.${index}`, conflict); });
}
const metadata = new Set();
for (const item of source.steps) {
  if (item.responsible) metadata.add(item.responsible);
  (item.legal_basis || []).forEach(value => metadata.add(value));
  (item.sources || []).forEach(value => { if (value.citation) metadata.add(value.citation); if (value.authority) metadata.add(value.authority); });
  (item.details || []).forEach(value => { if (value.citation) metadata.add(value.citation); });
}
for (const value of metadata) if (typeof translated.meta?.[value] !== 'string' || !translated.meta[value].trim()) missingMetadata.push(value);
console.log(JSON.stringify({ entries: source.steps.length, translatedFields: Object.values(translated.entries).reduce((total, entry) => total + Object.keys(entry).length, 0), metadataLabels: Object.keys(translated.meta || {}).length, missing: missing.length, missingMetadata: missingMetadata.length, noGujarati: noGujarati.length, missingNumbers: missingNumbers.length, firstMissingNumbers: missingNumbers.slice(0, 25) }, null, 2));
if (missing.length || missingMetadata.length || noGujarati.length || missingNumbers.length) process.exitCode = 1;
