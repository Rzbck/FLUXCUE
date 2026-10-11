import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, prohibitedPath, lockfileErrors } from '../scripts/check-public-security.mjs';

test('rejects credential-shaped GitHub token without printing token itself', () => {
  const token = 'gh' + 'p_' + 'A'.repeat(36);
  const messages = scanText('test ' + token, 'sample');
  assert.equal(messages.length, 1);
  assert.ok(!messages[0].includes(token));
});
test('rejects Tailscale authorization key and host identity', () => {
  assert.equal(scanText('ts' + 'key-' + 'A'.repeat(32)).length, 1);
  assert.equal(scanText('alpha' + '.beta.ts.net').length, 1);
});
test('rejects RFC1918 and CGNAT private IPs but allows loopback', () => {
  assert.equal(scanText('10.0.4.5 100.72.2.1 192.168.0.1').length, 1);
  assert.equal(scanText('127.0.0.1').length, 0);
});
test('rejects secret-like file paths', () => {
  assert.ok(prohibitedPath('prod/.env'));
  assert.ok(prohibitedPath('client/id_ed25519'));
  assert.ok(prohibitedPath('keys/prod.pem'));
  assert.ok(!prohibitedPath('docs/ARCHITECTURE.md'));
});
test('rejects non-public npm package source', () => {
  const root = {name:'fluxcue',lockfileVersion:3,packages:{'':{name:'fluxcue'}}};
  for (let i=0;i<21;i++) root.packages['node_modules/p'+i]={resolved:'https://registry.npmjs.org/p/-/p.tgz',integrity:'sha512-AAAA'};
  assert.deepEqual(lockfileErrors(root),[]);
  root.packages['node_modules/p0'].resolved='https://internal.example.invalid/pkg.tgz';
  assert.ok(lockfileErrors(root).some(m=>m.includes('Non-public npm registry')));
});
test('allows normal source text', () => {
  assert.deepEqual(scanText('Three.js, Vue 3, Art-Net and 127.0.0.1'),[]);
});
