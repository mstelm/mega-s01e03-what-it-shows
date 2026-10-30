<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { reviewReports } from '#lib/kb/review';
  import type { Report, Tenant } from '#lib/kb/causes';
  const tenants = Object.values(import.meta.glob<Tenant>('/src/lib/data/tenants/*.json', { eager: true, import: 'default' }));
  const review = $derived(reviewReports(reports as Report[], tenants));
  const flagged = $derived(review.merged.filter(r => notes.oneDayMove.includes(r.id)));
  const issue = { parser: 1, hint: 2 };
</script>

<p><strong>{review.merged.length} unique reports, {review.groups.length} causes.</strong>
  The export has {reports.length} rows; {review.duplicateRows} repeated rows are not additional reports.
  Tenant locale and form version plus report channel decide the cause, not the subject or intake guess.
  Intake tags disagree on {review.intakeDisagreements} reports.</p>

<table>
  <thead><tr><th>Cause / ticket</th><th>Reports</th><th>Tenants</th><th>First received</th><th>Last received</th></tr></thead>
  <tbody>{#each review.groups as g (g.cause)}
    <tr><td>{#if g.cause !== 'unplaced'}<a href="https://github.com/mstelm/mega-s01e03-what-it-shows/issues/{issue[g.cause]}">{g.cause}</a>{:else}Unplaced: investigate before merging{/if}</td><td>{g.reports.length}</td><td>{g.tenants}</td><td>{g.firstSeen}</td><td>{g.lastSeen}</td></tr>
  {/each}</tbody>
</table>

<h3>What the queue shows</h3>
<p>{review.receivedBeforeFirstMerge} reports arrived before the first merge day, {review.firstMerge}.
  That day contains {review.mergedOnFirstDay} merges. The July merge spike is backlog processing,
  not the start of reports: arrivals start in April. Received and merged timestamps measure different events.</p>

<h3>Unresolved one-day descriptions</h3>
<p>{flagged.length} reports are marked as one-day moves in desk notes. The tenant-based resolver currently
  places them under parser; their text does not prove that cause or a third timezone bug.
  Keep their IDs visible and reproduce them before changing the classification.</p>
<ul>{#each flagged as r (r.id)}<li><code>{r.id}</code> · {r.tenant}: “{r.body}”</li>{/each}</ul>

<h3>Traceable membership</h3>
{#each review.groups as g (g.cause)}
  <details><summary>{g.cause}: {g.reports.length} unique report IDs</summary><p>{g.reports.map(r => r.id).join(', ')}</p></details>
{/each}
