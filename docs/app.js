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

const TIMELINE_ORDER = ['g1', 'g2', 'c2', 'g3', 'c1', 'g4', 'g5', 'c3', 'g6', 'c4', 'g7', 'c5', 'g8', 'c6'];
const RELATED_AREAS = {
  g1: ['Register the case'],
  g2: ['Secure and record the scene', 'Victim and family'],
  g3: ['Secure and record the scene'],
  g4: ['Secure and record the scene'],
  g5: ['Collect and seize evidence', 'Search and seizure powers'],
  g6: ['Statements and witnesses'],
  g7: ['Case diary, reports and supervision'],
  g8: ['Charge sheet and court'],
  c1: ['Victim and family', 'Statements and witnesses'],
  c2: ['Victim and family', 'Forensic examination by crime type', 'Forensic laboratory'],
  c3: ['Victim and family'],
  c4: ['Digital and CCTV evidence', 'Collect and seize evidence'],
  c5: ['Statements and witnesses', 'Victim and family'],
  c6: ['Digital and CCTV evidence'],
};
const STORAGE_KEY = 'gujpol-workflow-11192050250093-2025-v1';
const SOURCE_STORAGE_KEY = 'gujpol-guidance-checklist-11192050250093-2025-v1';
const prefs = window.VivechnaPrefs;
function stepText(step, field) { return prefs.step(step, field); }
let data;
let sourceById;
let milestones = [];
let complete = new Set(['g1']);
let visibleLimit = 25;
let activeRelatedStep = null;
let guidanceClass = '';
let sourceChecked = {};
let guGuidance = null;

function sourceText(item, field, fallback = '') {
  if (prefs.language === 'gu') return guGuidance?.entries?.[item.id]?.[field] || fallback;
  if (field.includes('.')) return fallback;
  return item[field] || fallback;
}
function sourceLanguageAttributes() {
  return prefs.language === 'gu' ? 'lang="gu"' : 'lang="en" class="source-original"';
}
function metaText(value) {
  return prefs.language === 'gu' ? (guGuidance?.meta?.[value] || value) : value;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function textOf(value) { return escapeHTML(value || ''); }
function setText(id, value) { document.getElementById(id).textContent = value; }
function sourceFor(step) { return sourceById.get(step.source); }
function relatedEntries(step) {
  const areas = RELATED_AREAS[step.id] || [];
  return data.steps.filter(item => areas.includes(item.group));
}
function profileFromFIR() {
  const routed = data.case.crimeTypes.join(' ').toLowerCase();
  if (routed.includes('pocso') || data.case.sections.some(section => /pocso/i.test(section))) return CHILD_SEXUAL_OFFENCE;
  return [];
}
const OVERVIEW_KEY_FIELDS = ['FIR No.', 'Police Station', 'District', 'Date & time of offence', 'Date & time FIR registered', 'Sections applied'];
function overviewFieldHTML(field) {
  return `<div class="overview-field ${field.label === 'Sections applied' ? 'wide' : ''}"><span>${textOf(prefs.t(field.label))}</span><strong class="${field.redacted ? 'redacted-value' : ''}">${textOf(prefs.t(field.value))}</strong></div>`;
}
function renderOverview() {
  const fields = data.case.overviewFields || [];
  const byLabel = new Map(fields.map(field => [field.label, field]));
  const keyFields = OVERVIEW_KEY_FIELDS.map(label => byLabel.get(label)).filter(Boolean);
  const additional = fields.filter(field => !OVERVIEW_KEY_FIELDS.includes(field.label));
  document.getElementById('overview-key-fields').innerHTML = keyFields.map(overviewFieldHTML).join('');
  document.getElementById('overview-other-fields').innerHTML = additional.map(overviewFieldHTML).join('');
  setText('overview-more-count', prefs.t(`${additional.length} additional fields`));
}
function saveLocalState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...complete])); } catch (_) { /* local storage may be disabled */ }
}
function restoreSourceChecks() {
  try {
    const saved = JSON.parse(localStorage.getItem(SOURCE_STORAGE_KEY));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) sourceChecked = saved;
  } catch (_) { /* retain unchecked guidance */ }
}
function saveSourceChecks() {
  try { localStorage.setItem(SOURCE_STORAGE_KEY, JSON.stringify(sourceChecked)); } catch (_) { /* local storage may be disabled */ }
}
function guidanceClassFor(item) {
  if (item.id.startsWith('core-')) return 'common';
  if (item.id.startsWith('module-')) return 'specific';
  return 'reference';
}
function sourceActions(item) {
  if (!item.ticks?.length) return [{ key: 'review', text: prefs.t('I have reviewed this guidance entry.'), nested: false }];
  return item.ticks.flatMap((tick, index) => [
    { key: `a${index}`, text: sourceText(item, `ticks.${index}.do`, tick.do), nested: false },
    ...(tick.sub || []).map((sub, subIndex) => ({ key: `a${index}-s${subIndex}`, text: sourceText(item, `ticks.${index}.sub.${subIndex}`, sub), nested: true })),
  ]);
}
function sourceProgress(item) {
  const keys = new Set(Array.isArray(sourceChecked[item.id]) ? sourceChecked[item.id] : []);
  const actions = sourceActions(item);
  const checked = actions.filter(action => keys.has(action.key)).length;
  return { actions, keys, checked, done: checked === actions.length };
}
function sourceCompletedLabel() {
  const count = data.steps.filter(item => sourceProgress(item).done).length;
  return prefs.t(`${count} guidance ${count === 1 ? 'entry' : 'entries'} checked locally`);
}
function restoreLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) complete = new Set(saved.filter(id => id !== 'g1').concat('g1'));
  } catch (_) { /* retain source-confirmed registration */ }
}
function currentStep() {
  return TIMELINE_ORDER.map(id => milestones.find(step => step.id === id)).find(step => step && !step.optional && !complete.has(step.id));
}
function statusFor(step) {
  if (complete.has(step.id)) return 'complete';
  if (currentStep()?.id === step.id) return 'current';
  if (step.optional) return 'optional';
  return 'pending';
}
function statusLabel(status) { return prefs.t(({ complete: 'Completed', current: 'Current', pending: 'Pending', optional: 'Optional' })[status]); }
function citationLabel(item) {
  return [metaText(item.citation || item.document), item.section, item.page ? `${prefs.t('p.')} ${item.page}` : ''].filter(Boolean).join(' · ');
}
function cardHTML(step, index, specific) {
  const status = statusFor(step);
  const source = sourceFor(step);
  const tags = (source?.sources || []).slice(0, 2).map(item => `<span class="citation-tag">${textOf(citationLabel(item))}</span>`).join('');
  const actions = (source?.ticks || []).slice(0, 4).map((item, index) => `<li>${textOf(sourceText(source, `ticks.${index}.do`, item.do))}</li>`).join('');
  const baseText = source ? sourceText(source, 'text', source.text) : prefs.t('Consult the complete source guidance for this step.');
  const category = prefs.t(specific ? 'Crime-specific procedure' : 'Common procedure');
  const relatedCount = relatedEntries(step).length;
  const lang = sourceLanguageAttributes();
  const card = `<details class="step-card"><summary><span class="card-check" aria-hidden="true">${status === 'complete' ? '✓' : ''}</span><span class="step-main"><span class="type-label">${category}</span><strong>${textOf(stepText(step, 'title'))}</strong><small>${textOf(stepText(step, 'brief'))}</small></span><span class="badge ${status}">${statusLabel(status)}</span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="step-detail">
    ${source?.case_action ? `<div class="detail-label">FOR THIS FIR</div><p ${lang}>${textOf(sourceText(source, 'case_action', source.case_action))}</p>` : ''}
    <div class="detail-label">ORIGINAL GUIDANCE</div><p ${lang}>${textOf(baseText)}</p>
    ${step.why ? `<div class="detail-label">WHY THIS STEP</div><p>${textOf(stepText(step, 'why'))}</p>` : ''}
    ${actions ? `<div class="detail-label">KEY ACTIONS</div><ul class="source-actions" lang="${prefs.language}">${actions}</ul>` : ''}
    ${tags ? `<div class="detail-label">SOURCE REFERENCES</div><div class="source-citations" lang="${prefs.language}">${tags}</div>` : ''}
    <div class="detail-foot"><small lang="${prefs.language}">${source?.legal_basis?.length ? textOf(source.legal_basis.map(metaText).join(' · ')) : prefs.t('Review the complete source entry for detail.')}</small><button type="button" class="complete-button ${status === 'complete' ? 'undo' : ''}" data-toggle="${step.id}" ${step.completeFromFIR ? 'disabled title="Confirmed from FIR"' : ''}>${step.completeFromFIR ? 'Confirmed from FIR' : status === 'complete' ? 'Mark pending' : 'Mark complete'}</button></div>
    <div class="related-guidance"><div><strong>Guidance in this area</strong><small>${relatedCount} source entries · review applicability</small></div><div class="related-links"><button type="button" data-source="${textOf(step.source)}">Primary source</button><button type="button" data-related="${step.id}">Browse related guidance <span aria-hidden="true">→</span></button></div></div>
  </div></details>`;
  return `<div class="step-item timeline-row ${specific ? 'crime-specific' : 'common'} ${status}" id="step-${step.id}">${specific ? '<div class="timeline-blank"></div>' : `<div class="timeline-slot">${card}</div>`}<div class="timeline-marker" aria-label="Step ${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></div>${specific ? `<div class="timeline-slot">${card}</div>` : '<div class="timeline-blank"></div>'}</div>`;
}
function renderWorkflow() {
  const specific = milestones.filter(step => step.id.startsWith('c'));
  const ordered = TIMELINE_ORDER.map(id => milestones.find(step => step.id === id)).filter(Boolean);
  document.getElementById('timeline-rows').innerHTML = ordered.map((step, index) => cardHTML(step, index, step.id.startsWith('c'))).join('');
  setText('general-count', prefs.t(`${GENERAL.length} steps`));
  setText('specific-count', prefs.t(`${specific.length} steps`));
  const done = milestones.filter(step => complete.has(step.id)).length;
  const current = currentStep();
  const optional = milestones.filter(step => step.optional && !complete.has(step.id)).length;
  setText('progress-copy', prefs.t(`${done} of ${milestones.length} milestones marked complete`));
  const localDone = Math.max(0, done - 1);
  setText('progress-state', prefs.t(`1 confirmed by FIR · ${localDone} browser-local update${localDone === 1 ? '' : 's'}`));
  setText('milestone-count', milestones.length);
  setText('guidance-count', data.steps.length);
  setText('count-complete', done);
  setText('count-current', current ? 1 : 0);
  setText('count-pending', milestones.length - done - (current ? 1 : 0) - optional);
  setText('count-optional', optional);
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuemax', milestones.length);
  bar.setAttribute('aria-valuenow', done);
  document.getElementById('progress-fill').style.width = `${Math.round(done / milestones.length * 100)}%`;
  setText('next-title', current ? stepText(current, 'title') : prefs.t('All required steps marked complete'));
  setText('next-reason', current ? stepText(current, current.why ? 'why' : 'brief') : prefs.t('Review the case diary and remaining optional leads.'));
  setText('next-time', prefs.t(current?.urgent ? 'VERIFY STATUS' : current ? 'REVIEW NEXT' : 'REVIEW'));
  document.getElementById('jump-next').hidden = !current;
  prefs.translate(document.getElementById('workflow'));
}
function sourceSearchText(item) {
  return [item.id, item.title, item.text, item.case_action, item.group, prefs.t(item.group), item.deadline, item.responsible, metaText(item.responsible), ...Object.values(guGuidance?.entries?.[item.id] || {}), ...(item.legal_basis || []).flatMap(value => [value, metaText(value)]), ...(item.ticks || []).flatMap(tick => [tick.do, ...(tick.sub || [])]), ...(item.sources || []).flatMap(source => [source.citation, metaText(source.citation), source.section])].join(' ').toLowerCase();
}
function libraryCard(item) {
  const title = sourceText(item, 'title') || sourceText(item, 'text', item.text || prefs.t('Untitled guidance')).split(/[.;]/)[0].slice(0, 110);
  const progress = sourceProgress(item);
  const checklist = progress.actions.map(action => `<label class="source-check-row ${action.nested ? 'nested' : ''}"><input type="checkbox" data-source-check="${textOf(item.id)}" data-check-key="${action.key}" ${progress.keys.has(action.key) ? 'checked' : ''}><span>${textOf(action.text)}</span></label>`).join('');
  const details = (item.details || []).map((detail, index) => `<li>${textOf(sourceText(item, `details.${index}.text`, detail.text))} <small>— ${textOf([metaText(detail.citation), detail.section, detail.page ? `${prefs.t('p.')} ${detail.page}` : ''].filter(Boolean).join(' · '))}</small></li>`).join('');
  const sources = (item.sources || []).map(source => `<span class="citation-tag" title="${textOf(metaText(source.authority))}">${textOf(citationLabel(source))}</span>`).join('');
  const conflicts = (item.conflicts || []).map((conflict, index) => `<li>${textOf(typeof conflict === 'string' ? sourceText(item, `conflicts.${index}`, conflict) : JSON.stringify(conflict))}</li>`).join('');
  const classLabel = prefs.t(({ common: 'Common', specific: 'Crime-specific', reference: 'Supporting source' })[guidanceClassFor(item)]);
  const lang = sourceLanguageAttributes();
  const background = `<details class="source-background"><summary>Why, legal basis and source details <span aria-hidden="true">⌄</span></summary><div><h4>Original guidance</h4><p ${lang}>${textOf(sourceText(item, 'text', item.text))}</p>${item.triage_why ? `<h4>Why it appears</h4><p ${lang}>${textOf(sourceText(item, 'triage_why', item.triage_why))}</p>` : ''}${item.deadline ? `<h4>Timing</h4><p ${lang}>${textOf(sourceText(item, 'deadline', item.deadline))}</p>` : ''}${item.applies_when ? `<h4>Applies when</h4><p ${lang}>${textOf(sourceText(item, 'applies_when', item.applies_when))}</p>` : ''}${item.note ? `<h4>Note</h4><p ${lang}>${textOf(sourceText(item, 'note', item.note))}</p>` : ''}${item.legal_basis?.length ? `<h4>Legal basis</h4><p lang="${prefs.language}">${textOf(item.legal_basis.map(metaText).join(' · '))}</p>` : ''}${details ? `<h4>Additional guidance</h4><ul lang="${prefs.language}">${details}</ul>` : ''}${conflicts ? `<h4>Source differences</h4><ul lang="${prefs.language}">${conflicts}</ul>` : ''}${sources ? `<h4>Sources</h4><div lang="${prefs.language}">${sources}</div>` : ''}</div></details>`;
  return `<details class="library-result ${progress.done ? 'checked' : ''}" id="source-${textOf(item.id)}"><summary><span class="result-arrow">▸</span><span><strong ${lang}>${textOf(title)}</strong><small>${classLabel} · ${textOf(prefs.t(item.group))} · ${textOf(prefs.t(item.phase))}${item.responsible ? ` · <span lang="${prefs.language}">${textOf(metaText(item.responsible))}</span>` : ''}</small></span><span class="result-progress">${progress.checked}/${progress.actions.length}</span><span class="result-status">${textOf(prefs.t(({ MUST_DO: 'Must do', SHOULD_DO: 'Should do', REFERENCE: 'Reference' })[item.triage] || 'Reference'))}</span></summary><div class="result-detail">${item.case_action ? `<h4>For this FIR</h4><p ${lang}>${textOf(sourceText(item, 'case_action', item.case_action))}</p>` : ''}<div class="source-checklist"><div class="source-check-head"><strong>Action checklist</strong><span class="source-check-count">${progress.checked} of ${progress.actions.length} checked locally</span><button type="button" data-source-all="${textOf(item.id)}">${progress.done ? 'Clear checks' : 'Check all items'}</button></div><div class="source-check-items" lang="${prefs.language}">${checklist}</div></div>${background}</div></details>`;
}
function renderLibrary() {
  const term = document.getElementById('library-search').value.trim().toLowerCase();
  const group = document.getElementById('library-group').value;
  const phase = document.getElementById('library-phase').value;
  const priority = document.getElementById('library-priority').value;
  const areas = activeRelatedStep ? RELATED_AREAS[activeRelatedStep.id] : null;
  const matches = data.steps.filter(item => (!areas || areas.includes(item.group)) && (!guidanceClass || guidanceClassFor(item) === guidanceClass) && (!group || item.group === group) && (!phase || item.phase === phase) && (!priority || item.triage === priority) && (!term || sourceSearchText(item).includes(term)));
  if (activeRelatedStep) matches.sort((a, b) => Number(b.id === activeRelatedStep.source) - Number(a.id === activeRelatedStep.source));
  document.getElementById('library-results').innerHTML = matches.slice(0, visibleLimit).map(libraryCard).join('') || '<p class="empty-results">No guidance matches this search.</p>';
  document.getElementById('library-more').hidden = matches.length <= visibleLimit;
  setText('library-total', `${matches.length} OF ${data.steps.length} ENTRIES`);
  setText('library-progress', sourceCompletedLabel());
  document.getElementById('library-focus').hidden = !activeRelatedStep;
  if (activeRelatedStep) setText('library-focus-label', `${prefs.t('Guidance area:')} ${stepText(activeRelatedStep, 'title')}`);
  setText('library-filter-note', activeRelatedStep ? 'Showing source groups related to this milestone. Check applicability; checklist changes stay in this browser.' : 'Guidance includes required, conditional and reference material. Checklist changes stay in this browser, not the official case record.');
  prefs.translate(document.getElementById('library'));
}
function resetLibraryFilters() {
  ['library-search', 'library-group', 'library-phase', 'library-priority'].forEach(id => { document.getElementById(id).value = ''; });
  guidanceClass = '';
  document.querySelectorAll('[data-guidance-class]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.guidanceClass === '')));
  visibleLimit = 25;
}
function selectGuidanceClass(value) {
  guidanceClass = value;
  document.querySelectorAll('[data-guidance-class]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.guidanceClass === value)));
  visibleLimit = 25;
  renderLibrary();
}
function updateSourceCard(item) {
  const card = document.getElementById(`source-${item.id}`);
  if (!card) return;
  const progress = sourceProgress(item);
  card.classList.toggle('checked', progress.done);
  card.querySelector('.result-progress').textContent = `${progress.checked}/${progress.actions.length}`;
  card.querySelector('.source-check-count').textContent = prefs.t(`${progress.checked} of ${progress.actions.length} checked locally`);
  card.querySelector('[data-source-all]').textContent = prefs.t(progress.done ? 'Clear checks' : 'Check all items');
  card.querySelectorAll('[data-source-check]').forEach(input => { input.checked = progress.keys.has(input.dataset.checkKey); });
  setText('library-progress', sourceCompletedLabel());
}
function changeSourceCheck(id, key, checked) {
  const item = sourceById.get(id);
  if (!item) return;
  const progress = sourceProgress(item);
  if (checked) progress.keys.add(key); else progress.keys.delete(key);
  if (/^a\d+$/.test(key)) {
    progress.actions.filter(action => action.key.startsWith(`${key}-s`)).forEach(action => {
      if (checked) progress.keys.add(action.key); else progress.keys.delete(action.key);
    });
  }
  if (/^a\d+-s\d+$/.test(key)) {
    const parent = key.split('-')[0];
    const children = progress.actions.filter(action => action.key.startsWith(`${parent}-s`));
    if (children.every(action => progress.keys.has(action.key))) progress.keys.add(parent);
    else progress.keys.delete(parent);
  }
  sourceChecked[id] = [...progress.keys];
  saveSourceChecks();
  updateSourceCard(item);
}
function toggleEntireSource(id) {
  const item = sourceById.get(id);
  if (!item) return;
  const progress = sourceProgress(item);
  sourceChecked[id] = progress.done ? [] : progress.actions.map(action => action.key);
  saveSourceChecks();
  updateSourceCard(item);
}
function showLibrary() {
  selectTab('library', true);
  window.history.pushState(null, '', '#library');
}
function browseAllGuidance() {
  activeRelatedStep = null;
  resetLibraryFilters();
  renderLibrary();
  showLibrary();
}
function openRelated(id) {
  activeRelatedStep = milestones.find(step => step.id === id) || null;
  resetLibraryFilters();
  renderLibrary();
  showLibrary();
}
function openSource(id) {
  activeRelatedStep = null;
  resetLibraryFilters();
  window.history.pushState(null, '', '#library');
  const search = document.getElementById('library-search');
  search.value = id;
  renderLibrary();
  selectTab('library');
  const result = document.getElementById(`source-${id}`);
  if (result) { result.open = true; result.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
const TAB_NAMES = ['overview', 'workflow', 'library'];
function selectTab(name, scroll = false) {
  const selected = TAB_NAMES.includes(name) ? name : 'workflow';
  TAB_NAMES.forEach(tabName => {
    const active = tabName === selected;
    document.getElementById(tabName).hidden = !active;
    const tab = document.getElementById(`tab-${tabName}`);
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    const sideLink = document.querySelector(`.side-nav a[href="#${tabName}"]`);
    if (sideLink) sideLink.classList.toggle('active', active);
  });
  if (scroll) document.getElementById('case-tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function setupTabs() {
  selectTab(window.location.hash.slice(1));
  document.querySelectorAll('.case-tabs a, .side-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const tab = link.getAttribute('href').slice(1);
      if (!TAB_NAMES.includes(tab)) return;
      event.preventDefault();
      selectTab(tab, true);
      window.history.pushState(null, '', `#${tab}`);
    });
  });
  document.getElementById('case-tabs').addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const active = TAB_NAMES.findIndex(name => document.getElementById(`tab-${name}`).getAttribute('aria-selected') === 'true');
    const next = TAB_NAMES[(active + (event.key === 'ArrowRight' ? 1 : TAB_NAMES.length - 1)) % TAB_NAMES.length];
    selectTab(next);
    document.getElementById(`tab-${next}`).focus();
    window.history.pushState(null, '', `#${next}`);
  });
  window.addEventListener('popstate', () => selectTab(window.location.hash.slice(1)));
}
function setupNavigation() {
  const edge = document.getElementById('nav-edge');
  const trigger = document.getElementById('menu-trigger');
  const backdrop = document.getElementById('nav-backdrop');
  const setOpen = (open) => {
    edge.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close case navigation' : 'Open case navigation');
    trigger.querySelector('span').textContent = open ? '×' : '☰';
  };
  trigger.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 620px)').matches) setOpen(!edge.classList.contains('is-open'));
  });
  backdrop.addEventListener('click', () => setOpen(false));
  edge.querySelectorAll('.side-nav a').forEach(link => link.addEventListener('click', event => {
    setOpen(false);
    if (event.detail > 0) link.blur();
  }));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    setOpen(false);
    if (window.matchMedia('(max-width: 620px)').matches) trigger.focus();
    else if (edge.contains(document.activeElement)) document.activeElement.blur();
  });
  edge.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) trigger.setAttribute('aria-expanded', 'true');
  });
  edge.addEventListener('mouseleave', () => {
    if (!edge.classList.contains('is-open') && !edge.contains(document.activeElement)) trigger.setAttribute('aria-expanded', 'false');
  });
  edge.addEventListener('focusin', () => {
    if (!window.matchMedia('(max-width: 620px)').matches) trigger.setAttribute('aria-expanded', 'true');
  });
  edge.addEventListener('focusout', () => {
    setTimeout(() => {
      if (!edge.contains(document.activeElement) && !edge.classList.contains('is-open')) trigger.setAttribute('aria-expanded', 'false');
    }, 0);
  });
}
async function initialize() {
  setupNavigation();
  setupTabs();
  try {
    const [response, translationResponse] = await Promise.all([
      fetch(document.body.dataset.caseData || 'case-data.json'),
      fetch('../../gu-guidance.json?v=1').catch(() => ({ ok: false })),
    ]);
    if (!response.ok) throw new Error('Failed to load case guidance');
    data = await response.json();
    if (translationResponse.ok) {
      const draft = await translationResponse.json();
      if (Object.keys(draft.entries || {}).length === data.steps.length) guGuidance = draft;
    }
    if (!guGuidance) {
      document.querySelector('[data-language="gu"]').disabled = true;
      if (prefs.language === 'gu') prefs.setLanguage('en');
    }
    if (['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) {
      try {
        const privateResponse = await fetch('../../private-overview.json');
        if (privateResponse.ok) {
          const privateOverview = await privateResponse.json();
          if (privateOverview.overviewFields?.length === 18) {
            data.case.overviewFields = privateOverview.overviewFields;
            if (privateOverview.narrativeSummary) document.querySelector('.overview-synopsis p').textContent = privateOverview.narrativeSummary;
          }
        }
      } catch (_) { /* local full record is optional */ }
    }
    sourceById = new Map(data.steps.map(step => [step.id, step]));
    milestones = [...GENERAL, ...profileFromFIR()];
    restoreLocalState();
    restoreSourceChecks();
    renderOverview();
    setText('source-count', data.steps.length);
    setText('library-intro', `Search all ${data.steps.length} source entries. Open an entry for its full actions, legal basis and citations.`);
    ['common', 'specific', 'reference'].forEach(category => setText(`class-${category}-count`, data.steps.filter(item => guidanceClassFor(item) === category).length));
    setText('class-all-count', data.steps.length);
    const select = document.getElementById('library-group');
    data.groupOrder.filter(group => data.steps.some(step => step.group === group)).forEach(group => select.add(new Option(group, group)));
    renderWorkflow();
    renderLibrary();
    prefs.translate();
    document.addEventListener('vivechna:languagechange', () => {
      renderOverview();
      renderWorkflow();
      renderLibrary();
      setText('library-intro', prefs.t(`Search all ${data.steps.length} source entries. Open an entry for its full actions, legal basis and citations.`));
      prefs.translate();
    });
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
      const related = event.target.closest('[data-related]');
      if (related) openRelated(related.dataset.related);
      const sourceAll = event.target.closest('[data-source-all]');
      if (sourceAll) toggleEntireSource(sourceAll.dataset.sourceAll);
    });
    document.getElementById('library-results').addEventListener('change', event => {
      if (event.target.matches('[data-source-check]')) changeSourceCheck(event.target.dataset.sourceCheck, event.target.dataset.checkKey, event.target.checked);
    });
    document.querySelectorAll('[data-guidance-class]').forEach(button => button.addEventListener('click', () => selectGuidanceClass(button.dataset.guidanceClass)));
    document.getElementById('browse-guidance').addEventListener('click', browseAllGuidance);
    document.getElementById('library-focus-clear').addEventListener('click', browseAllGuidance);
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
    ['library-group', 'library-phase', 'library-priority'].forEach(id => document.getElementById(id).addEventListener('change', () => { visibleLimit = 25; renderLibrary(); }));
    document.getElementById('library-more').addEventListener('click', () => { visibleLimit += 25; renderLibrary(); });
  } catch (error) {
    document.getElementById('load-error').hidden = false;
    console.error(error);
  }
}
initialize();
