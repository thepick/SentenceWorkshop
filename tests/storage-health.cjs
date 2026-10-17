'use strict';
// Minimal storage safety net for SentenceWorkshop. Loads the real index.html
// inline scripts (load smoke) and exercises PROGRESS.load/save round-trip, the
// unreadable-data fallback, and credential isolation (sync envelope has no token).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function section(file, start, end) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const first = source.indexOf(start), last = source.indexOf(end, first);
  assert.ok(first >= 0 && last > first, 'Missing source section in ' + file + ': ' + start);
  return source.slice(first, last);
}

function context(source, globals) {
  return vm.runInNewContext(source + '\n;globalThis', { ...globals, console });
}

function loadSmoke(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  let count = 0;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["'](?:module|application\/)/.test(attrs)) continue;
    new vm.Script(m[2]);
    count++;
  }
  assert.ok(count >= 1, 'No parseable inline scripts in ' + file);
  return count;
}

(async () => {
  const file = 'index.html';
  loadSmoke(file);

  const key = 'sentence-workshop-course-v1';
  const empty = () => ({ schema: 1, rubric: 1, students: [] });

  const load = context(
    section(file, 'function load(storage)', 'function save(storage'),
    { key, empty, validate: x => x },
  ).load;
  const save = context(
    section(file, 'function save(storage', '  return Object.freeze'),
    { key },
  ).save;

  // Save/load round-trip on the student-data path.
  const store = {};
  const storage = {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
  };
  const data = { schema: 1, rubric: 1, students: [] };
  assert.equal(save(storage, data), true, 'save persisted student progress');
  const loaded = load(storage);
  assert.equal(loaded.writable, true, 'load reports writable');
  assert.deepEqual(JSON.parse(JSON.stringify(loaded.data)), data, 'round-trip preserves student data');

  // Unreadable data falls back to a fresh empty state instead of throwing.
  store[key] = '{broken json';
  const fallback = load(storage);
  assert.equal(fallback.writable, false, 'corrupt progress is not writable');
  assert.ok(fallback.error.length > 0, 'corrupt progress reports an error');
  assert.deepEqual(fallback.data, empty(), 'corrupt progress falls back to empty');

  // No storage at all: save refuses, load is read-only and explains why.
  assert.equal(save(undefined, data), false, 'save without storage returns false');
  assert.equal(load(undefined).writable, false, 'load without storage is read-only');

  // Credential isolation: the Google sync envelope never carries a token.
  const envelope = context(
    section(file, 'function envelope()', 'function cache('),
    { owner: 'sub-1', device: 'dev-1', profile: { updatedAt: 5 }, copy: x => JSON.parse(JSON.stringify(x)) },
  ).envelope;
  const env = envelope();
  assert.equal(env.app, 'SentenceWorkshop');
  assert.equal(JSON.stringify(env).includes('token'), false, 'sync envelope omits credentials');

  console.log('storage-health: load smoke, save/load round-trip, corrupt-data fallback, no-storage guard, credential isolation passed.');
})().catch(e => { console.error(e); process.exitCode = 1; });
