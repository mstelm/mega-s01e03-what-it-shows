# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 review

- [Signed review source](src/routes/kb/incidents/4471-review/+page.svx)
- [Actual rendered review HTML](build/kb/incidents/4471-review/index.html)
- [Parser: 379 unique reports](https://github.com/mstelm/mega-s01e03-what-it-shows/issues/1)
- [Form hint: 33 unique reports](https://github.com/mstelm/mega-s01e03-what-it-shows/issues/2)
- [Replacement decision 0002](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx)
- [Updated working triage guide](src/routes/kb/triage/dedupe/+page.svx)

The later engineering update on the course page says #4471 closed on 5 October:
parser **fixed** (`fix(dates): parse dd/mm for eu locales`), hint **won't fix** because
booking-v3 was retired. Issue #1 closes as completed; issue #2 as not planned, not as a fix.
The rendered review includes these outcomes separately from export-time observations.

Decision 0001 is preserved byte-for-byte as the historical accepted record. The old incident
page is marked historical and links to the review. The index links the active replacement.
The five one-day descriptions remain visible as unresolved evidence, not a proven third cause.

### Run and verify

```sh
npm ci
npm run build
npm test
npm run preview -- --port 4173
```

Open `http://127.0.0.1:4173/kb/incidents/4471-review/`. This compiles the actual `.svx` pages
and Svelte components with mdsvex, SvelteKit and the static adapter. The committed `build/`
contains the full rendered site, CSS and browser modules, not a hand-written approximation.
The build computes tables, chart bars, stale warnings, interactive dedupe examples and desk refs.
The signed review renders `DR-HRY1-ZZ99` from its frontmatter signature via `RenderStamp`.
No public hosting account is needed: the course can read both source and rendered HTML in this repo.

The export is a snapshot, not a live queue. Replacing it and rebuilding recomputes the component
counts; fixture tests deliberately flag changed totals for review. Issue counts describe this snapshot.
Do not publish any course sign-in tokens or local challenge exchange logs here.
