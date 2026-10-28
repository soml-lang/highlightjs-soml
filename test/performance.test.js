import {spawnSync} from 'node:child_process';
import process from 'node:process';
import {test} from 'node:test';
import assert from 'node:assert/strict';

test('long tokens and comments do not cause excessive backtracking', () => {
	const result = spawnSync(process.execPath, ['test-support/performance.js'], {
		cwd: new URL('..', import.meta.url),
		encoding: 'utf8',
		timeout: 5000,
	});

	assert.equal(result.status, 0, result.error?.message ?? result.stderr);
});
