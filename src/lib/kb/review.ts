import { groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

// Share the desk's cause resolver rather than classify by subject, browser, or intake guess.
export function reviewReports(rows: Report[], tenants: Tenant[], ticket = 4471) {
  const byHandle = new Map(tenants.map(t => [t.handle, t]));
  const merged = uniqueById(rows).filter(r => r.mergedInto === ticket);
  const groups = groupByCause(merged, r => byHandle.get(r.tenant));
  const firstMerge = merged.flatMap(r => r.mergedAt ? [r.mergedAt.slice(0, 10)] : []).sort()[0];
  return {
    merged, groups, firstMerge,
    duplicateRows: rows.filter(r => r.mergedInto === ticket).length - merged.length,
    receivedBeforeFirstMerge: merged.filter(r => r.receivedAt.slice(0, 10) < firstMerge).length,
    mergedOnFirstDay: merged.filter(r => r.mergedAt?.slice(0, 10) === firstMerge).length,
    intakeDisagreements: groups.reduce((sum, g) => sum + g.reports.filter(r => r.meta.intakeTag !== g.cause).length, 0)
  };
}
