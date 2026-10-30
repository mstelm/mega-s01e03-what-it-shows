import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { causeOf, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';
import { reviewReports } from '../src/lib/kb/review.ts';
const root = new URL('../src/lib/data/', import.meta.url);
const rows = JSON.parse(fs.readFileSync(new URL('reports-4471.json', root)));
const tenants = fs.readdirSync(new URL('tenants/', root)).map(f => JSON.parse(fs.readFileSync(new URL('tenants/' + f, root))));
const tenant = handle => tenants.find(t => t.handle === handle);
const review = reviewReports(rows, tenants);

test('overlapping export rows count once and partition the whole ticket', () => {
  assert.equal(rows.length, 427);
  assert.equal(review.merged.length, 412);
  assert.equal(review.duplicateRows, 15);
  assert.deepEqual(review.groups.map(g => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  const ids = review.groups.flatMap(g => g.reports.map(r => r.id));
  assert.equal(new Set(ids).size, 412);
  assert.equal(ids.length, 412);
  assert.equal(review.intakeDisagreements, 38);
});
test('classification uses tenant and channel, not browser or intake guess', () => {
  for (const [id, expected] of [['R-41205', 'parser'], ['R-41230', 'hint']]) {
    const r = rows.find(r => r.id === id);
    assert.notEqual(r.meta.intakeTag, expected);
    assert.equal(causeOf(r, tenant(r.tenant)), expected);
  }
  assert.equal(causeOf({ channel: 'form' }, tenant('alder.physio')), 'hint');
  assert.equal(causeOf({ channel: 'app' }, tenant('alder.physio')), 'parser');
  assert.equal(causeOf({ channel: 'form' }, { handle: 'us', locale: 'en-US', form: 'booking-v3' }), null);
});
test('same subject is not proof; missing tenant never merges', () => {
  const a = { channel: 'form', subject: 'Date is wrong' };
  assert.equal(sameCause(a, tenant('alder.physio'), a, tenant('kettle.books')), false);
  assert.equal(sameCause(a, undefined, a, undefined), false);
  assert.equal(sameCause({ channel: 'app' }, tenant('kettle.books'), { channel: 'email' }, tenant('kettle.books')), true);
});
test('merge spike differs from arrivals and one-day descriptions remain accounted for', () => {
  assert.equal(review.firstMerge, '2026-07-02');
  assert.equal(review.receivedBeforeFirstMerge, 183);
  assert.equal(review.mergedOnFirstDay, 184);
  const notes = JSON.parse(fs.readFileSync(new URL('desk-notes.json', root)));
  assert.equal(uniqueById(rows).filter(r => notes.oneDayMove.includes(r.id)).length, 5);
});
test('production HTML contains computed evidence and the signature-derived desk ref', () => {
  const html = fs.readFileSync(new URL('../build/kb/incidents/4471-review/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('379'));
  assert.ok(html.includes('33'));
  assert.ok(html.includes('412'));
  assert.ok(html.includes('different causes — keep apart'));
  assert.ok(html.includes(deskRef('mstelm / Pi / S01E03 / 2026-10-30')));
  assert.ok(!html.includes('no desk ref:'));
  assert.ok(!html.includes('&lt;CauseTable'));
  assert.ok(html.includes('2026-10-05'));
  assert.ok(html.includes('fix(dates): parse dd/mm for eu locales'));
  assert.ok(html.includes('booking-v3 form retired'));
  assert.ok(html.includes('not planned'));
});
