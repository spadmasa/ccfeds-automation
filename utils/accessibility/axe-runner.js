// Reusable axe-core accessibility scanner.
// Used by any test suite - not just feds-lnav.
// axe-core (@axe-core/playwright) is already in package.json.

import AxeBuilder from '@axe-core/playwright';

// Runs a WCAG 2.1 AA scan on the full page or a specific CSS selector.
// Returns the axe results object - violations, passes, incomplete.
export async function runAxeScan(page, { selector = null, wcag = ['wcag21aa'] } = {}) {
  let builder = new AxeBuilder({ page }).withTags(wcag);
  if (selector) builder = builder.include(selector);
  return builder.analyze();
}

// Returns a short summary of violations for logging / Allure annotations.
export function getViolationSummary(results) {
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    affectedNodes: v.nodes.length,
    helpUrl: v.helpUrl,
  }));
}
