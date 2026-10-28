import {test} from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import soml from 'highlightjs-soml';

const source = 'flag: true';
const expected = '<span class="syntax-attr">flag</span><span class="syntax-punctuation">:</span> <span class="syntax-literal">true</span>';

test('the grammar respects a custom registration name and class prefix', () => {
	const highlighter = hljs.newInstance();
	highlighter.debugMode();
	highlighter.configure({classPrefix: 'syntax-'});
	highlighter.registerLanguage('config', soml);
	const result = highlighter.highlight(source, {language: 'config'});
	assert.equal(result.language, 'config');
	assert.equal(result.value, expected);
});

test('registering the grammar preserves existing languages and configuration', () => {
	const highlighter = hljs.newInstance();
	highlighter.debugMode();
	highlighter.registerLanguage('json', json);
	highlighter.configure({classPrefix: 'syntax-'});
	highlighter.registerLanguage('soml', soml);
	assert.deepEqual(highlighter.listLanguages(), ['json', 'soml']);
	assert.equal(highlighter.highlight(source, {language: 'soml'}).value, expected);
});
