# Investigation workflow redesign

This static site has a case homepage and a case-specific investigation page. The homepage links to the existing live FIR uploader; GitHub Pages cannot run that processor. The case page reorganizes FIR `11192050250093/2025` into one numbered timeline with common procedures on the left, crime-specific procedures on the right, and a searchable library of all 854 original guidance entries.

The public site is in `docs/`. Its FIR overview includes all 18 field labels from the source, with names, contacts, officer identities, and exact incident location redacted. It excludes the FIR narrative. Source guidance is retained in redacted `docs/case-data.json` with legal bases, detailed actions, and citations. The 14 milestones provide a concise overview; each opens guidance from related investigation areas. The full library supports Common, Crime-specific, and Supporting-source classification, search, time, importance, and activity filters. Area links are navigation aids, not a claim that every entry applies to the case.

Only FIR registration is initially marked complete because the source does not provide a task completion log. Subsequent milestone and detailed-guidance checklist changes are local browser planning state, not official case status. The live reference site does not expose a case-update API to this static project, so officer notes, evidence references, ownership, and an authoritative review history cannot be saved to the live case record here.

To regenerate the data after obtaining the source case page, save its HTML as `original-case.html` in the repository root and run `node scripts/build-data.cjs`. The build fails if known identifying strings remain in the output. Review any regenerated content for new personal information before publishing.

GitHub Pages publishes `docs/` through `.github/workflows/pages.yml` after a push to `master`.

For a local preview, run `node scripts/preview.cjs` and open `http://127.0.0.1:8766/`.
