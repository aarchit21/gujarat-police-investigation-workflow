# Investigation workflow redesign

This static page reorganizes FIR `11192050250093/2025` into a concise general workflow, a POCSO and child sexual offence workflow, and a searchable library of all 854 original guidance entries.

The public site is in `docs/`. It deliberately excludes the FIR narrative, victim and accused identities, contact details, and exact incident location. Source guidance is retained in redacted `docs/case-data.json` with legal bases, detailed actions, and citations. Only FIR registration is initially marked complete because the source does not provide a task completion log. Subsequent completion changes are local browser planning state, not official case status.

To regenerate the data after obtaining the source case page, save its HTML as `original-case.html` in the repository root and run `node scripts/build-data.cjs`. The build fails if known identifying strings remain in the output. Review any regenerated content for new personal information before publishing.

GitHub Pages publishes `docs/` through `.github/workflows/pages.yml` after a push to `master`.
