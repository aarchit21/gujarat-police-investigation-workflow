# Investigation workflow redesign

This static site has a case homepage and a case-specific investigation page. The homepage links to the existing live FIR uploader; GitHub Pages cannot run that processor. The case page reorganizes FIR `11192050250093/2025` into one numbered timeline with common procedures on the left, crime-specific procedures on the right, and a searchable library of all 854 original guidance entries.

The public site is in `docs/`. Its FIR overview includes all 18 source fields with their full values. All 854 source guidance entries are retained in `docs/case-data.json` with their original case references, legal bases, detailed actions, and citations. The 14 milestones provide a concise overview; each opens guidance from related investigation areas. The full library supports Common, Crime-specific, and Supporting-source classification, search, time, importance, and activity filters. Area links are navigation aids, not a claim that every entry applies to the case.

Gujarati mode uses a checked-in translation of guidance titles, actions, checklists, details, and source metadata. The original English remains available by switching to English mode. To regenerate the draft, set `OLLAMA_API_KEY` only in the current process environment and run `node scripts/translate-guidance.cjs`, then `node scripts/verify-gu.cjs`. The key and translation checkpoint are not committed.

Only FIR registration is initially marked complete because the source does not provide a task completion log. Subsequent milestone and detailed-guidance checklist changes are local browser planning state, not official case status. The live reference site does not expose a case-update API to this static project, so officer notes, evidence references, ownership, and an authoritative review history cannot be saved to the live case record here.

The original case HTML and the earlier case-data generation helper are kept locally and excluded from Git. The Gujarati guidance translation retains its prior text with the restored source names, location, and date inserted locally in the 62 affected fields.

GitHub Pages publishes `docs/` through `.github/workflows/pages.yml` after a push to `master`.

For a local preview with the full source narrative, run `node scripts/build-private-overview.cjs` and `node scripts/preview.cjs`, then open `http://127.0.0.1:8766/`. The generated `docs/private-overview.json` is ignored by Git and is used only when the case page runs on loopback. The preview server binds to `127.0.0.1`.
