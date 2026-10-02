const GENERAL = [
  { id: 'g1', title: 'Receive complaint and register the FIR', brief: 'Confirm the FIR record and informant copy.', source: 'core-registration-mandatory-registration', why: 'The FIR number and registration date are present in the source case record.', completeFromFIR: true },
  { id: 'g2', title: 'Protect people and respond to the scene', brief: 'Assess immediate safety and arrange needed assistance.', source: 'core-scene-management-proceed-to-spot' },
  { id: 'g3', title: 'Secure and preserve the scene', brief: 'Control access and prevent disturbance of possible evidence.', source: 'core-scene-management-cordon-and-preserve' },
  { id: 'g4', title: 'Record the scene before collection', brief: 'Photograph, map and document the scene as found.', source: 'core-scene-management-photograph-before-disturbance' },
  { id: 'g5', title: 'Collect, seal and log evidence', brief: 'Prepare seizure records and maintain custody details.', source: 'core-scene-management-seizure-memo' },
  { id: 'g6', title: 'Record witness accounts', brief: 'Take statements promptly and preserve their original wording.', source: 'core-witnesses-statements-no-inducement-threat-promise' },
  { id: 'g7', title: 'Document each investigation action', brief: 'Maintain the case diary, evidence record and supervision trail.', source: 'core-registration-case-diary-note' },
  { id: 'g8', title: 'Review findings and prepare the report', brief: 'Resolve outstanding evidence and record the investigation outcome.', source: 'core-chargesheet-closure-decide-chargesheet-or-final-report' },
];

const CHILD_SEXUAL_OFFENCE = [
  { id: 'c1', title: 'Record a child-sensitive statement', brief: 'Use a safe setting and the child’s own words.', source: 'module-sexual-offences-child-statement-place-and-trust', why: 'The FIR states that the complainant was under 18 at the time of the alleged offence.' },
  { id: 'c2', title: 'Verify the victim’s medical examination', brief: 'Check the medical record, consent and preserved findings.', source: 'module-sexual-offences-medical-exam-24-hours', why: 'The stated sexual-offence sections required prompt medical attention; the source does not confirm whether it occurred.', urgent: true },
  { id: 'c3', title: 'Notify child-protection authorities', brief: 'Complete required child welfare and court notifications.', source: 'module-sexual-offences-report-to-cwc', why: 'POCSO sections are stated on the FIR.' },
  { id: 'c4', title: 'Preserve digital threats and communications', brief: 'Secure relevant images, call records and platform evidence.', source: 'core-evidence-collection-electronic-evidence-seizure', why: 'The FIR describes threats to share photos and call recordings.' },
  { id: 'c5', title: 'Request the Magistrate-recorded statement', brief: 'Route the victim statement application without avoidable delay.', source: 'core-registration-magistrate-statement-183-6a', why: 'The source guidance marks this as required for the stated sexual-offence route.' },
  { id: 'c6', title: 'Check available CCTV along the route', brief: 'Preserve footage before it is overwritten, where cameras exist.', source: 'reference-forensic-by-crime--forensic-cctv-image-analysis-tl01-retrieve-the-cctv-data-from-th', why: 'The FIR describes travel between locations; footage may help establish chronology if available.', optional: true },
];

const PRIORITY = ['c2', 'c1', 'c5', 'c3', 'c4', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'c6'];
const STORAGE_KEY = 'gujpol-workflow-11192050250093-2025-v1';
let data;
let sourceById;
let milestones = [];
let complete = new Set(['g1']);
let visibleLimit = 25;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function textOf(value) { return escapeHTML(value || ''); }
function setText(id, value) { document.getElementById(id).textContent = value; }
function sourceFor(step) { return sourceById.get(step.source); }
function profileFromFIR() {
  const routed = data.case.crimeTypes.join(' ').toLowerCase();
  if (routed.includes('pocso') || data.case.sections.some(section => /pocso/i.test(section))) return CHILD_SEXUAL_OFFENCE;
  return [];
}
function saveLocalState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...complete])); } catch (_) { /* local storage may be disabled */ }
}
function restoreLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) complete = new Set(saved.filter(id => id !== 'g1').concat('g1'));
  } catch (_) { /* retain source-confirmed registration */ }
}
function currentStep() {
  return PRIORITY.map(id => milestones.find(step => step.id === id)).find(step => step && !step.optional && !complete.has(step.id)) || milestones.find(step => !step.optional && !complete.has(step.id));
}
function statusFor(step) {
  if (complete.has(step.id)) return 'complete';
  if (currentStep()?.id === step.id) return 'current';
  if (step.optional) return 'optional';
  return 'pending';
}
function statusLabel(status) { return ({ complete: 'Completed', current: 'Current', pending: 'Pending', optional: 'Optional' })[status]; }
function citationLabel(item) {
  return [item.citation || item.document, item.section, item.page ? `p. ${item.page}` : ''].filter(Boolean).join(' · ');
}
function cardHTML(step, index, specific) {
  const status = statusFor(step);
  const source = sourceFor(step);
  const tags = (source?.sources || []).slice(0, 2).map(item => `<span class="citation-tag">${textOf(citationLabel(item))}</span>`).join('');
  const actions = (source?.ticks || []).slice(0, 4).map(item => `<li>${textOf(item.do)}</li>`).join('');
  const baseText = source?.text || 'Consult the complete source guidance for this step.';
  return `<div class="step-item ${status}${specific ? ' specific' : ''}" id="step-${step.id}"><span class="step-node" aria-hidden="true">${status === 'complete' ? '✓' : status === 'current' ? '•' : ''}</span><details class="step-card"><summary><span class="step-order">${String(index + 1).padStart(2, '0')}</span><span class="step-main"><strong>${textOf(step.title)}</strong><small>${textOf(step.brief)}</small></span><span class="badge ${status}">${statusLabel(status)}</span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="step-detail">${source?.case_action ? `<div class="detail-label">FOR THIS FIR</div><p>${textOf(source.case_action)}</p>` : ''}<div class="detail-label">ORIGINAL GUIDANCE</div><p>${textOf(baseText)}</p>${step.why ? `<div class="detail-label">WHY THIS STEP</div><p>${textOf(step.why)}</p>` : ''}${actions ? `<div class="detail-label">KEY ACTIONS</div><ul class="source-actions">${actions}</ul>` : ''}${tags ? `<div class="detail-label">SOURCE REFERENCES</div><div class="source-citations">${tags}</div>` : ''}<div class="detail-foot"><small>${source?.legal_basis?.length ? textOf(source.legal_basis.join(' · ')) : 'Review the complete source entry for detail.'}</small><button type="button" class="complete-button ${status === 'complete' ? 'undo' : ''}" data-toggle="${step.id}" ${step.completeFromFIR ? 'disabled title="Confirmed from FIR"' : ''}>${step.completeFromFIR ? 'Confirmed from FIR' : status === 'complete' ? 'Mark pending' : 'Mark complete'}</button></div><button type="button" class="text-action" data-source="${textOf(step.source)}" style="margin-top:12px">View complete source entry →</button></div></details></div>`;
}
function renderWorkflow() {
  const specific = milestones.filter(step => step.id.startsWith('c'));
  document.getElementById('general-list').innerHTML = GENERAL.map((step, index) => cardHTML(step, index, false)).join('');
  document.getElementById('specific-list').innerHTML = specific.map((step, index) => cardHTML(step, index, true)).join('') || '<p class="empty-results">No crime-specific route is present in this case data.</p>';
  setText('general-count', `${GENERAL.length} STEPS`);
  setText('specific-count', `${specific.length} STEPS`);
  const done = milestones.filter(step => complete.has(step.id)).length;
  const current = currentStep();
  const optional = milestones.filter(step => step.optional && !complete.has(step.id)).length;
  setText('progress-done', done);
  setText('progress-total', milestones.length);
  setText('progress-copy', `${done} of ${milestones.length} steps completed`);
  setText('count-complete', done);
  setText('count-current', current ? 1 : 0);
  setText('count-pending', milestones.length - done - (current ? 1 : 0) - optional);
  setText('count-optional', optional);
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuemax', milestones.length);
  bar.setAttribute('aria-valuenow', done);
  document.getElementById('progress-fill').style.width = `${Math.round(done / milestones.length * 100)}%`;
  setText('next-title', current?.title || 'All required steps marked complete');
  setText('next-reason', current?.why || (current ? current.brief : 'Review the case diary and remaining optional leads.'));
  setText('next-time', current?.urgent ? 'VERIFY STATUS' : current ? 'REVIEW NEXT' : 'REVIEW');
  document.getElementById('jump-next').hidden = !current;
}
function sourceSearchText(item) {
  return [item.id, item.title, item.text, item.case_action, item.group, ...(item.legal_basis || []), ...(item.sources || []).map(source => `${source.citation} ${source.section}`)].join(' ').toLowerCase();
}
function libraryCard(item) {
  const title = item.title || (item.text || 'Untitled guidance').split(/[.;]/)[0].slice(0, 110);
  const actions = (item.ticks || []).map(action => `<li>${textOf(action.do)}${action.sub?.length ? `<ul>${action.sub.map(sub => `<li>${textOf(sub)}</li>`).join('')}</ul>` : ''}</li>`).join('');
  const details = (item.details || []).map(detail => `<li>${textOf(detail.text)} <small>— ${textOf([detail.citation, detail.section, detail.page ? `p. ${detail.page}` : ''].filter(Boolean).join(' · '))}</small></li>`).join('');
  const sources = (item.sources || []).map(source => `<span class="citation-tag" title="${textOf(source.authority)}">${textOf(citationLabel(source))}</span>`).join('');
  const conflicts = (item.conflicts || []).map(conflict => `<li>${textOf(typeof conflict === 'string' ? conflict : JSON.stringify(conflict))}</li>`).join('');
  return `<details class="library-result" id="source-${textOf(item.id)}"><summary><span class="result-arrow">▸</span><span><strong>${textOf(title)}</strong><small>${textOf(item.group)} · ${textOf(item.phase)}${item.responsible ? ` · ${textOf(item.responsible)}` : ''}</small></span><span class="result-status">${textOf(item.triage?.replaceAll('_', ' ') || 'REFERENCE')}</span></summary><div class="result-detail">${item.case_action ? `<h4>For this FIR</h4><p>${textOf(item.case_action)}</p>` : ''}<h4>Original guidance</h4><p>${textOf(item.text)}</p>${item.triage_why ? `<h4>Why it appears</h4><p>${textOf(item.triage_why)}</p>` : ''}${item.deadline ? `<h4>Timing</h4><p>${textOf(item.deadline)}</p>` : ''}${item.applies_when ? `<h4>Applies when</h4><p>${textOf(item.applies_when)}</p>` : ''}${item.note ? `<h4>Note</h4><p>${textOf(item.note)}</p>` : ''}${item.legal_basis?.length ? `<h4>Legal basis</h4><p>${textOf(item.legal_basis.join(' · '))}</p>` : ''}${actions ? `<h4>Actions</h4><ul>${actions}</ul>` : ''}${details ? `<h4>Additional guidance</h4><ul>${details}</ul>` : ''}${conflicts ? `<h4>Source differences</h4><ul>${conflicts}</ul>` : ''}${sources ? `<h4>Sources</h4><div>${sources}</div>` : ''}</div></details>`;
}
function renderLibrary() {
  const term = document.getElementById('library-search').value.trim().toLowerCase();
  const group = document.getElementById('library-group').value;
  const matches = data.steps.filter(item => (!group || item.group === group) && (!term || sourceSearchText(item).includes(term)));
  document.getElementById('library-results').innerHTML = matches.slice(0, visibleLimit).map(libraryCard).join('') || '<p class="empty-results">No guidance matches this search.</p>';
  document.getElementById('library-more').hidden = matches.length <= visibleLimit;
  setText('library-total', `${matches.length} ENTRIES`);
}
function openSource(id) {
  const search = document.getElementById('library-search');
  search.value = id;
  document.getElementById('library-group').value = '';
  visibleLimit = 25;
  renderLibrary();
  const result = document.getElementById(`source-${id}`);
  if (result) { result.open = true; result.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function updateNav() {
  const links = [...document.querySelectorAll('.side-nav a')];
  const current = [...links].reverse().find(link => { const target = document.querySelector(link.getAttribute('href')); return target && target.getBoundingClientRect().top < 150; }) || links[0];
  links.forEach(link => link.classList.toggle('active', link === current));
}
async function initialize() {
  try {
    const response = await fetch('case-data.json');
    if (!response.ok) throw new Error('Failed to load case data');
    data = await response.json();
    sourceById = new Map(data.steps.map(step => [step.id, step]));
    milestones = [...GENERAL, ...profileFromFIR()];
    restoreLocalState();
    setText('section-list', data.case.sections.join(' · '));
    setText('source-count', data.steps.length);
    setText('library-intro', `Search all ${data.steps.length} redacted source entries. Open an entry for its full actions, legal basis and citations.`);
    const select = document.getElementById('library-group');
    data.groupOrder.filter(group => data.steps.some(step => step.group === group)).forEach(group => select.add(new Option(group, group)));
    renderWorkflow();
    renderLibrary();
    document.addEventListener('click', event => {
      const toggle = event.target.closest('[data-toggle]');
      if (toggle) {
        const id = toggle.dataset.toggle;
        if (id === 'g1') return;
        if (complete.has(id)) complete.delete(id); else complete.add(id);
        saveLocalState();
        const openIds = [...document.querySelectorAll('.step-card[open]')].map(card => card.closest('.step-item').id);
        renderWorkflow();
        openIds.forEach(openId => { const card = document.querySelector(`#${openId} .step-card`); if (card) card.open = true; });
      }
      const source = event.target.closest('[data-source]');
      if (source) openSource(source.dataset.source);
    });
    document.getElementById('jump-next').addEventListener('click', () => {
      const next = currentStep();
      if (!next) return;
      const card = document.querySelector(`#step-${next.id} .step-card`);
      card.open = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.querySelector('summary').focus();
    });
    let searchTimer;
    document.getElementById('library-search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { visibleLimit = 25; renderLibrary(); }, 130); });
    document.getElementById('library-group').addEventListener('change', () => { visibleLimit = 25; renderLibrary(); });
    document.getElementById('library-more').addEventListener('click', () => { visibleLimit += 25; renderLibrary(); });
    window.addEventListener('scroll', updateNav, { passive: true });
  } catch (error) {
    document.getElementById('load-error').hidden = false;
    console.error(error);
  }
}
initialize();
