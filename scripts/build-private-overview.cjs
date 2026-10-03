// Keep the complete FIR overview on the local machine only.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'original-case.html'), 'utf8');
const match = html.match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('Case payload was not found');
const source = JSON.parse(match[1]);
if (source.fir?.fields?.length !== 18) throw new Error('Expected 18 FIR overview fields');
const overviewFields = source.fir.fields.map(field => ({ label: String(field.k), value: String(field.v ?? ''), redacted: false }));
if (overviewFields.some(field => !field.value.trim())) throw new Error('An FIR overview field is empty in the source');
fs.writeFileSync(path.join(root, 'docs', 'private-overview.json'), JSON.stringify({ overviewFields, narrativeSummary: String(source.fir.narrative_summary || '') }));
console.log(`Prepared ${overviewFields.length} FIR fields for the local view`);
