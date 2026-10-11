import test from 'node:test';
import assert from 'node:assert/strict';
import { pagesHtmlErrors } from '../scripts/check-pages-output.mjs';

const html = (a,b) => '<script type="module" src="' + a + '"></script><link rel="stylesheet" href="' + b + '">';
test('rejects root-path assets that break project GitHub Pages', () => {
  assert.ok(pagesHtmlErrors(html('/assets/foo.js', '/assets/bar.css')).length > 0);
});
test('rejects other-repository asset links', () => {
  assert.ok(pagesHtmlErrors(html('/OTHER/assets/foo.js', '/FLUXCUE/assets/bar.css')).length > 0);
});
test('rejects nonexistent assets', () => {
  assert.ok(pagesHtmlErrors(html('/FLUXCUE/assets/ghost.js', '/FLUXCUE/assets/ghost.css')).length > 0);
});
test('rejects missing asset tags', () => {
  assert.ok(pagesHtmlErrors('<html><body>hello</body></html>').length > 0);
});
