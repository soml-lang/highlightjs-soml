import {test} from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import soml from 'highlightjs-soml';

const highlighter = hljs.newInstance();
highlighter.debugMode();
highlighter.registerLanguage('json', json);
highlighter.registerLanguage('soml', soml);

for (const source of ['{}', '[]', '[1,2,3]', '"text"', '\'text\'', '123', '-0.5']) {
	test(`common syntax does not imply SOML (${source})`, () => {
		assert.equal(highlighter.highlightAuto(source, ['soml']).language, undefined, source);
	});
}

for (const source of ['{"port": 8080, "enabled": true}', '{"values": [1, 2, 3]}']) {
	test(`JSON is preferred for shared syntax (${source})`, () => {
		assert.equal(highlighter.highlightAuto(source).language, 'json', source);
	});
}

for (const source of [
	'name: \'api\'\ntimeout: 30s',
	'description: \'\'\'\ntext\n\'\'\'',
	'description: """\ntext\n"""',
	'[30s]',
	'[2026-09-19T14:00:00Z]',
	'[0xFF]',
	'[infinity]',
]) {
	test(`distinctive SOML syntax remains detectable (${JSON.stringify(source)})`, () => {
		assert.equal(highlighter.highlightAuto(source).language, 'soml', source);
	});
}
