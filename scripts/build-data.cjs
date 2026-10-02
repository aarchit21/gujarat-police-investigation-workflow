const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'original-case.html'), 'utf8');
const match = html.match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('Case payload was not found');
const source = JSON.parse(match[1]);
const fields = ['id', 'title', 'text', 'case_action', 'group', 'phase', 'triage', 'triage_why', 'authority', 'legal_basis', 'deadline', 'responsible', 'applies_when', 'note', 'statutory_character', 'details', 'sources', 'conflicts', 'ticks', 'primary', 'kind'];

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redact(item)]));
  if (typeof value !== 'string') return value;
  return value
    .replace(/Analben Dr\/o Dasharathbhai Merabhai Makwana/gi, 'the victim')
    .replace(/Mitesh Trikambhai Rathod/gi, 'the accused')
    .replace(/Moje Jaldeep Flat, Sanand|Moje Jaldeep Flat|Jaldeep Flat/gi, 'the reported location')
    .replace(/Analben/gi, 'the victim')
    .replace(/Mitesh/gi, 'the accused')
    .replace(/\bMakwana\b/gi, '')
    .replace(/\bRathod\b/gi, '')
    .replace(/\b(?:Jotsnaben|Divyaben|Kailasben|Chaloda|Dholka|Rahmalpur|Bavla)\b/gi, 'the relevant person or location')
    .replace(/\b19\/02\/2025\b/g, 'the reported date')
    .replace(/\s{2,}/g, ' ');
}

const steps = source.steps.map((step) => redact(Object.fromEntries(fields.filter((field) => step[field] != null).map((field) => [field, step[field]]))));
const privateOverviewLabels = new Set(['Place of offence', 'Complainant', 'Complainant address', 'Complainant mobile', 'Victim', 'Accused', 'Accused address', 'Accused mobile', 'Investigating Officer', 'Registering Officer']);
const overviewFields = source.fir.fields.map((field) => ({
  label: field.k,
  value: privateOverviewLabels.has(field.k) ? 'Redacted in public view' : String(field.v).replace(/\b\d{10}\b/g, 'Redacted in public view'),
  redacted: privateOverviewLabels.has(field.k),
}));
const output = {
  case: {
    number: source.fir.fir_number,
    station: source.fir.police_station,
    district: source.fir.raw.district.value,
    sections: source.fir.sections_stated,
    crimeTypes: source.routing.crime_types,
    overviewFields,
  },
  groupOrder: source.group_order,
  steps,
};
const serialized = JSON.stringify(output);
if (/Analben|Mitesh|Makwana|Rathod|Jaldeep|Jotsnaben|Divyaben|Kailasben|Chaloda|Dholka|Rahmalpur|Bavla|72020\s*28181|81281\s*43932/i.test(serialized)) throw new Error('Personally identifying case data remains in output');
fs.mkdirSync(path.join(__dirname, '..', 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'case-data.json'), serialized);
console.log(`Wrote ${steps.length} redacted guidance entries (${Buffer.byteLength(serialized)} bytes)`);
