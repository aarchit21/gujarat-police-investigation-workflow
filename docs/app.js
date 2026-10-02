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
let data;
let sourceById;
let milestones = [];
let complete = new Set(['g1']);
let visibleLimit = 25;
let activeRelatedStep = null;

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
  const category = specific ? 'Case-related procedure' : 'Common procedure';
  const relatedCount = relatedEntries(step).length;
  const card = `<details class="step-card"><summary><span class="card-check" aria-hidden="true">${status === 'complete' ? '✓' : ''}</span><span class="step-main"><span class="type-label">${category}</span><strong>${textOf(step.title)}</strong><small>${textOf(step.brief)}</small></span><span class="badge ${status}">${statusLabel(status)}</span><span class="chevron" aria-hidden="true">⌄</span></summary><div class="step-detail">${source?.case_action ? `<div class="detail-label">FOR THIS FIR</div><p>${textOf(source.case_action)}</p>` : ''}<div class="detail-label">ORIGINAL GUIDANCE</div><p>${textOf(baseText)}</p>${step.why ? `<div class="detail-label">WHY THIS STEP</div><p>${textOf(step.why)}</p>` : ''}${actions ? `<div class="detail-label">KEY ACTIONS</div><ul class="source-actions">${actions}</ul>` : ''}${tags ? `<div class="detail-label">SOURCE REFERENCES</div><div class="source-citations">${tags}</div>` : ''}<div class="detail-foot"><small>${source?.legal_basis?.length ? textOf(source.legal_basis.join(' · ')) : 'Review the complete source entry for detail.'}</small><button type="button" class="complete-button ${status === 'complete' ? 'undo' : ''}" data-toggle="${step.id}" ${step.completeFromFIR ? 'disabled title="Confirmed from FIR"' : ''}>${step.completeFromFIR ? 'Confirmed from FIR' : status === 'complete' ? 'Mark pending' : 'Mark complete'}</button></div><div class="related-guidance"><div><strong>Guidance in this area</strong><small>${relatedCount} source entries · review applicability</small></div><div class="related-links"><button type="button" data-source="${textOf(step.source)}">Primary source</button><button type="button" data-related="${step.id}">Browse related guidance <span aria-hidden="true">→</span></button></div></div></div></details>`;
  return `<div class="step-item timeline-row ${specific ? 'case-related' : 'common'} ${status}" id="step-${step.id}">${specific ? '<div class="timeline-blank"></div>' : `<div class="timeline-slot">${card}</div>`}<div class="timeline-marker" aria-label="Step ${index + 1}"><span>${String(index + 1).padStart(2, '0')}</span></div>${specific ? `<div class="timeline-slot">${card}</div>` : '<div class="timeline-blank"></div>'}</div>`;
}
function renderWorkflow() {
  const specific = milestones.filter(step => step.id.startsWith('c'));
  const ordered = TIMELINE_ORDER.map(id => milestones.find(step => step.id === id)).filter(Boolean);
  document.getElementById('timeline-rows').innerHTML = ordered.map((step, index) => cardHTML(step, index, step.id.startsWith('c'))).join('');
  setText('general-count', `${GENERAL.length} steps`);
  setText('specific-count', `${specific.length} steps`);
  const done = milestones.filter(step => complete.has(step.id)).length;
  const current = currentStep();
  const optional = milestones.filter(step => step.optional && !complete.has(step.id)).length;
  setText('progress-copy', `${done} of ${milestones.length} milestones marked complete`);
  const localDone = Math.max(0, done - 1);
  setText('progress-state', `1 confirmed by FIR · ${localDone} browser-local update${localDone === 1 ? '' : 's'}`);
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
  setText('next-title', current?.title || 'All required steps marked complete');
  setText('next-reason', current?.why || (current ? current.brief : 'Review the case diary and remaining optional leads.'));
  setText('next-time', current?.urgent ? 'VERIFY STATUS' : current ? 'REVIEW NEXT' : 'REVIEW');
  document.getElementById('jump-next').hidden = !current;
}
function sourceSearchText(item) {
  return [item.id, item.title, item.text, item.case_action, item.group, item.deadline, item.responsible, ...(item.legal_basis || []), ...(item.ticks || []).flatMap(tick => [tick.do, ...(tick.sub || [])]), ...(item.sources || []).map(source => `${source.citation} ${source.section}`)].join(' ').toLowerCase();
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
  const phase = document.getElementById('library-phase').value;
  const priority = document.getElementById('library-priority').value;
  const areas = activeRelatedStep ? RELATED_AREAS[activeRelatedStep.id] : null;
  const matches = data.steps.filter(item => (!areas || areas.includes(item.group)) && (!group || item.group === group) && (!phase || item.phase === phase) && (!priority || item.triage === priority) && (!term || sourceSearchText(item).includes(term)));
  if (activeRelatedStep) matches.sort((a, b) => Number(b.id === activeRelatedStep.source) - Number(a.id === activeRelatedStep.source));
  document.getElementById('library-results').innerHTML = matches.slice(0, visibleLimit).map(libraryCard).join('') || '<p class="empty-results">No guidance matches this search.</p>';
  document.getElementById('library-more').hidden = matches.length <= visibleLimit;
  setText('library-total', `${matches.length} OF ${data.steps.length} ENTRIES`);
  document.getElementById('library-focus').hidden = !activeRelatedStep;
  if (activeRelatedStep) setText('library-focus-label', `Guidance area: ${activeRelatedStep.title}`);
  setText('library-filter-note', activeRelatedStep ? `Showing the source groups related to this milestone. Some entries are conditional or reference material; check applicability before acting.` : 'Guidance includes required, conditional and reference material. Check applicability against the case record.');
}
function resetLibraryFilters() {
  ['library-search', 'library-group', 'library-phase', 'library-priority'].forEach(id => { document.getElementById(id).value = ''; });
  visibleLimit = 25;
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
    const response = await fetch(document.body.dataset.caseData || 'case-data.json');
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
      const related = event.target.closest('[data-related]');
      if (related) openRelated(related.dataset.related);
    });
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
