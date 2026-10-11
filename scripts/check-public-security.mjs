// Security fence for the PUBLIC repo and its static Studio distribution.
// NEVER output matched secret values: only rule + location. Not a substitute for history scanning.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

export const prohibitedPath = (file) => {
  const p = file.replaceAll('\\', '/');
  return /(^|\/)(?:\.env(?:\..*)?|id_(?:rsa|ed25519|ecdsa)(?:\.pub)?|authorized_keys|known_hosts)$/i.test(p)
    || /\.(?:pem|key|p12|pfx|ovpn|kdbx|sqlite|sqlite3)$/i.test(p);
};
const patterns = [
  ['private-key-block', /-----BEGIN (?:RSA|EC|DSA|OPENSSH|ENCRYPTED) PRIVATE KEY-----/g],
  ['github-credential', /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[opsru]_[A-Za-z0-9]{28,})\b/g],
  ['tailscale-auth-key', /\btskey-[A-Za-z0-9_-]{20,}\b/g],
  ['provider-credential', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{18,}\b/g],
  ['tailnet-host', /\b[a-z0-9-]+\.[a-z0-9-]+\.ts\.net\b/gi],
  ['private-network-address', /(?:^|[^\d])(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|100\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?!\d)/gm],
];
export function scanText(content, label = 'file') {
  const failures = [];
  for (const [rule, regex] of patterns) {
    regex.lastIndex = 0;
    const hit = regex.exec(content);
    if (hit) failures.push(label + ': ' + rule + ' (line ' + (content.slice(0, hit.index).match(/\n/g)?.length + 1 || 1) + ')');
  }
  return failures;
}
export function lockfileErrors(lock) {
  const errors = [];
  if (!lock || lock.name !== 'fluxcue' || lock.lockfileVersion !== 3 || !lock.packages?.['']) return ['Invalid lockfile root'];
  const entries = Object.entries(lock.packages).filter(([key]) => key);
  if (entries.length < 20) errors.push('Unexpectedly small dependency lock');
  for (const [key, value] of entries) {
    if (!key.startsWith('node_modules/')) errors.push('Invalid package key (no package value disclosed)');
    if (typeof value.resolved === 'string' && !value.resolved.startsWith('https://registry.npmjs.org/')) errors.push('Non-public npm registry in lockfile: ' + key);
    if (value.resolved && !/^sha512-[A-Za-z0-9+/=]+$/.test(value.integrity || '')) errors.push('Missing SHA-512 integrity: ' + key);
    if (value.hasInstallScript && !value.optional) {
      // Not necessarily malicious; npm ci --ignore-scripts is required by workflow.
    }
  }
  return errors;
}
function walkFiles(dir) {
  if (!existsSync(dir)) throw new Error('Distribution does not exist');
  const files = [];
  for (const item of readdirSync(dir)) {
    const p = join(dir, item);
    const stat = statSync(p);
    if (stat.isDirectory()) files.push(...walkFiles(p));
    else if (stat.isFile()) files.push(p);
    else throw new Error('Non-regular file in static distribution');
  }
  return files;
}
function verify(mode) {
  const failures = [];
  const files = mode === '--repo'
    ? execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
    : walkFiles('dist');
  if (!files.length) failures.push('No files inspected');
  for (const file of files) {
    if (prohibitedPath(file)) failures.push(file + ': prohibited path');
    if (mode === '--dist' && (/(^|\/)\./.test(file.replaceAll('\\', '/')) || extname(file) === '.map')) failures.push(file + ': hidden file or sourcemap in release');
    const b = readFileSync(file);
    if (b.includes(0)) {
      if (mode === '--repo') failures.push(file + ': binary tracked file requires separate review');
      continue;
    }
    failures.push(...scanText(b.toString('utf8'), file));
  }
  if (mode === '--repo') {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    failures.push(...lockfileErrors(lock));
  }
  if (failures.length) {
    for (const item of failures) console.error('SECURITY FAIL:', item);
    process.exitCode = 1;
  } else {
    console.log('SECURITY PASS: ' + files.length + ' ' + (mode === '--repo' ? 'tracked public files' : 'static distribution files') + ' scanned; no prohibited indicators');
  }
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const mode = process.argv[2];
  if (!['--repo', '--dist'].includes(mode)) { console.error('Usage: node scripts/check-public-security.mjs --repo|--dist'); process.exitCode = 2; }
  else verify(mode);
}
