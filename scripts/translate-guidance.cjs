// Generate a checked-in Gujarati draft from the published source data.
// The Ollama key is read only from the process environment and is never written here.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'docs', 'case-data.json');
const workPath = process.env.OLLAMA_TRANSLATION_WORKFILE || path.join(root, '.translation-work.json');
const outputPath = path.join(root, 'docs', 'gu-guidance.json');
const sourceBuffer = fs.readFileSync(sourcePath);
const sourceHash = crypto.createHash('sha256').update(sourceBuffer).digest('hex');
const source = JSON.parse(sourceBuffer);
let apiKey = process.env.OLLAMA_API_KEY;
const model = process.env.OLLAMA_TRANSLATION_MODEL || 'gemma4:31b';
const apiURL = process.env.OLLAMA_API_URL || 'https://ollama.com/api/chat';
const localAPI = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//.test(apiURL);
const translateGemma = /^translategemma(?::|$)/.test(model);
const sample = process.argv.includes('--sample');
const oneBatch = process.argv.includes('--one-batch');

const segments = [];
function collect(item, field, value) {
  if (typeof value === 'string' && value.trim()) segments.push({ id: item.id, field, text: value });
}
for (const item of source.steps) {
  for (const field of ['title', 'text', 'case_action', 'triage_why', 'deadline', 'applies_when', 'note', 'statutory_character']) collect(item, field, item[field]);
  (item.ticks || []).forEach((tick, index) => {
    collect(item, `ticks.${index}.do`, tick.do);
    (tick.sub || []).forEach((sub, subIndex) => collect(item, `ticks.${index}.sub.${subIndex}`, sub));
  });
  (item.details || []).forEach((detail, index) => collect(item, `details.${index}.text`, detail.text));
  (item.conflicts || []).forEach((conflict, index) => { if (typeof conflict === 'string') collect(item, `conflicts.${index}`, conflict); });
}
const metadata = new Set();
for (const item of source.steps) {
  if (item.responsible) metadata.add(item.responsible);
  (item.legal_basis || []).forEach(value => metadata.add(value));
  (item.sources || []).forEach(value => { if (value.citation) metadata.add(value.citation); if (value.authority) metadata.add(value.authority); });
  (item.details || []).forEach(value => { if (value.citation) metadata.add(value.citation); });
}
for (const value of metadata) collect({ id: '@meta' }, crypto.createHash('sha256').update(value).digest('hex'), value);

const state = fs.existsSync(workPath) ? JSON.parse(fs.readFileSync(workPath, 'utf8')) : { sourceHash, model, translations: {} };
if (state.sourceHash !== sourceHash || state.model !== model) throw new Error('Existing translation checkpoint has a different source or model');
const keyOf = segment => `${segment.id}::${segment.field}`;
const needed = (sample ? segments.slice(0, 1) : segments).filter(segment => !state.translations[keyOf(segment)]);
const batches = [];
let batch = [];
let size = 0;
for (const segment of needed) {
  if (batch.length && (batch.length >= (translateGemma ? 1 : 5) || size + segment.text.length > 2000)) { batches.push(batch); batch = []; size = 0; }
  batch.push(segment);
  size += segment.text.length;
}
if (batch.length) batches.push(batch);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function splitLongText(value, limit = 600) {
  const result = [];
  let remaining = value.trim();
  while (remaining.length > limit) {
    const window = remaining.slice(0, limit + 1);
    const candidates = ['. ', '; ', ': ', ' '].map(separator => window.lastIndexOf(separator) + separator.length);
    const boundary = Math.max(...candidates.filter(index => index >= limit / 2));
    const end = Number.isFinite(boundary) ? boundary : limit;
    result.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  if (remaining) result.push(remaining);
  return result;
}
async function translateBatch(parts) {
  if (!translateGemma && parts.length === 1 && parts[0].text.length > 700) {
    const pieces = splitLongText(parts[0].text);
    const translated = [];
    let input = 0;
    let output = 0;
    for (const piece of pieces) {
      const result = await translateBatch([{ ...parts[0], text: piece }]);
      translated.push(result.output[0]);
      input += result.usage.input;
      output += result.usage.output;
    }
    return { output: [translated.join(' ')], usage: { input, output } };
  }
  if (translateGemma) {
    const output = [];
    let inputTokens = 0;
    let outputTokens = 0;
    for (const part of parts) {
      const prompt = `You are a professional English (en) to Gujarati (gu) translator. Your goal is to accurately convey the meaning and nuances of the original English text while adhering to Gujarati grammar, vocabulary, and cultural sensitivities. Keep legal acronyms such as BNSS, BNS, BSA and POCSO, section numbers, years, measurements, negations, and deadlines unchanged. Produce only the Gujarati translation, without any additional explanations or commentary. Please translate the following English text into Gujarati:\n\n${part.text}`;
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localAPI ? {} : { Authorization: `Bearer ${apiKey}` }) },
        body: JSON.stringify({ model, stream: false, think: false, options: { temperature: 0, num_ctx: 4096 }, messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(localAPI ? 300000 : 180000),
      });
      if (!response.ok) throw new Error(`Ollama request returned HTTP ${response.status}`);
      const result = await response.json();
      const translation = result.message?.content?.trim();
      if (!translation || (part.text.length > 30 && !/[\u0A80-\u0AFF]/.test(translation))) throw new Error('TranslateGemma returned an incomplete or non-Gujarati translation');
      output.push(translation);
      inputTokens += result.prompt_eval_count || 0;
      outputTokens += result.eval_count || 0;
    }
    return { output, usage: { input: inputTokens, output: outputTokens } };
  }
  const strings = parts.map(part => part.text);
  const request = {
    model,
    stream: true,
    think: false,
    options: { temperature: 0, num_ctx: 16384 },
    messages: [
      { role: 'system', content: 'You are translating source-linked Indian police investigation guidance from English into clear, formal Gujarati. Translate every input string faithfully and completely. Do not add, omit, summarize, explain, or change legal conditions, negations, deadlines, names, places, named Acts, section numbers, years, measurements, or citations. Retain legal acronyms such as BNSS, BNS, BSA and POCSO exactly. Return only a JSON object with a translations array in the same order. Never include the original English alongside the Gujarati.' },
      { role: 'user', content: JSON.stringify({ translations: strings }) },
    ],
  };
  const response = await fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(localAPI ? {} : { Authorization: `Bearer ${apiKey}` }) },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Ollama request returned HTTP ${response.status}`);
  const chunks = (await response.text()).trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const result = chunks.at(-1) || {};
  if (!result.done) throw new Error('Ollama stream ended before completion');
  const raw = chunks.map(chunk => chunk.message?.content || '').join('').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const output = JSON.parse(raw).translations;
  if (!Array.isArray(output) || output.length !== strings.length || output.some(text => typeof text !== 'string' || !text.trim())) throw new Error('Model returned incomplete translations');
  if (output.some((text, index) => strings[index].length > 30 && !/[\u0A80-\u0AFF]/.test(text))) throw new Error('Model returned a non-Gujarati translation');
  return { output, usage: { input: result.prompt_eval_count || 0, output: result.eval_count || 0 } };
}

async function translateResilient(parts, label) {
  let lastError;
  for (let attempt = 0; attempt < (sample ? 1 : 2); attempt++) {
    try { return await translateBatch(parts); }
    catch (error) {
      lastError = error;
      console.warn(`${label}: retry ${attempt + 1} (${error.message})`);
      if (attempt < 1) await sleep(error.message.includes('timeout') ? 1500 : 2500);
    }
  }
  if (parts.length === 1) throw new Error(`${label}: ${lastError.message}`);
  console.warn(`${label}: retrying as smaller batches`);
  const middle = Math.ceil(parts.length / 2);
  const left = await translateResilient(parts.slice(0, middle), `${label}a`);
  const right = await translateResilient(parts.slice(middle), `${label}b`);
  return { output: [...left.output, ...right.output], usage: { input: left.usage.input + right.usage.input, output: left.usage.output + right.usage.output } };
}

async function main() {
  if (!apiKey && process.argv.includes('--key-stdin')) {
    apiKey = await new Promise((resolve, reject) => {
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', chunk => { process.stdin.pause(); resolve(chunk.trim()); });
      process.stdin.once('error', reject);
      process.stdin.resume();
    });
  }
  if (!apiKey && !localAPI) throw new Error('OLLAMA_API_KEY is required for the cloud endpoint');
  let inputTokens = 0;
  let outputTokens = 0;
  let nextBatch = 0;
  let finished = 0;
  let firstError;
  async function worker() {
    while (nextBatch < batches.length && !firstError) {
      const index = nextBatch++;
      const parts = batches[index];
      try {
        if (sample) console.log(`Testing ${model} on ${parts.length} guidance segment`);
        const translated = await translateResilient(parts, `Batch ${index + 1}/${batches.length}`);
        parts.forEach((part, partIndex) => { state.translations[keyOf(part)] = translated.output[partIndex]; });
        inputTokens += translated.usage.input;
        outputTokens += translated.usage.output;
        finished++;
        if (finished % 10 === 0 || finished === batches.length || sample || oneBatch) fs.writeFileSync(workPath, JSON.stringify(state));
        if (sample) console.log(JSON.stringify(parts.map((part, i) => ({ field: part.field, english: part.text, gujarati: translated.output[i] })), null, 2));
        if (oneBatch) console.log(`Validated one full batch of ${parts.length} segments`);
        if (!sample && !oneBatch && (finished % 10 === 0 || finished === batches.length)) console.log(`Translated ${finished}/${batches.length} batches; ${Object.keys(state.translations).length}/${segments.length} segments; ${inputTokens} input + ${outputTokens} output tokens this run`);
        if (sample || oneBatch) break;
      } catch (error) { firstError = error; }
    }
  }
  const workerCount = 1;
  await Promise.all(Array.from({ length: workerCount }, worker));
  if (firstError) { fs.writeFileSync(workPath, JSON.stringify(state)); throw firstError; }
  if (!sample && segments.every(segment => state.translations[keyOf(segment)])) {
    const entries = {};
    const meta = {};
    for (const segment of segments) {
      if (segment.id === '@meta') { meta[segment.text] = state.translations[keyOf(segment)]; continue; }
      if (!entries[segment.id]) entries[segment.id] = {};
      entries[segment.id][segment.field] = state.translations[keyOf(segment)];
    }
    fs.writeFileSync(outputPath, JSON.stringify({ sourceHash, model, entries, meta }));
    console.log(`Wrote ${Object.keys(entries).length} Gujarati guidance entries and ${Object.keys(meta).length} translated metadata labels`);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
