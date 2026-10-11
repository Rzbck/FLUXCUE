// Verify GitHub Pages assets are rooted at /FLUXCUE/ and exist in dist.
// Only validates the built public static preview; never connects to any server.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function pagesHtmlErrors(html, base = '/FLUXCUE/') {
  const problems = [];
  if (!/^\/[A-Za-z0-9_-]+\/$/.test(base)) problems.push('Invalid expected project base');
  const urls = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  const local = urls.filter(u => u.includes('/assets/'));
  if (local.length < 2) problems.push('Expected JS and CSS asset references');
  for (const url of local) {
    if (!url.startsWith(base + 'assets/')) {
      problems.push('Found an asset URL outside expected Pages base');
      continue;
    }
    if (!/^\/[A-Za-z0-9_-]+\/assets\/[A-Za-z0-9._-]+$/.test(url)) {
      problems.push('Unsafe asset URL');
      continue;
    }
    if (!existsSync(join('dist', url.slice(base.length)))) {
      problems.push('Referenced asset does not exist in dist');
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  try {
    const errors = pagesHtmlErrors(readFileSync('dist/index.html', 'utf8'));
    if (errors.length) {
      errors.forEach(e => console.error('PAGES FAIL:', e));
      process.exitCode = 1;
    } else {
      console.log('PAGES PASS: /FLUXCUE/ static links resolve inside dist');
    }
  } catch (error) {
    console.error('PAGES FAIL: cannot inspect built HTML');
    process.exitCode = 1;
  }
}
