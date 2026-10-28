import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js/lib/core';
import soml from 'highlightjs-soml';

const highlighter = hljs.newInstance();
highlighter.debugMode();
highlighter.registerLanguage('soml', soml);

const fixturesDirectory = path.join(import.meta.dirname, 'markup', 'soml');

const files = fs.readdirSync(fixturesDirectory);
const expectationNames = files.filter(file => file.endsWith('.expect.txt')).map(file => file.slice(0, -'.expect.txt'.length));
const sourceNames = files.filter(file => file.endsWith('.txt') && !file.endsWith('.expect.txt')).map(file => file.slice(0, -'.txt'.length));

test('every fixture has an expectation', () => {
	assert.ok(expectationNames.length > 0);
	assert.deepEqual(new Set(sourceNames), new Set(expectationNames));
});

for (const name of expectationNames) {
	const source = fs.readFileSync(path.join(fixturesDirectory, `${name}.txt`), 'utf8');
	const expected = fs.readFileSync(path.join(fixturesDirectory, `${name}.expect.txt`), 'utf8');

	test(name, () => {
		assert.equal(highlighter.highlight(source, {language: 'soml'}).value, expected);
	});
}

for (const [source, expected] of [
	['', ''],
	[' \t\n\t ', ' \t\n\t '],
	['# eof', '<span class="hljs-comment"># eof</span>'],
	['/* eof', '<span class="hljs-comment">/* eof</span>'],
	['\'eof', '<span class="hljs-string">&#x27;eof</span>'],
	['"eof\\', String.raw`<span class="hljs-string">&quot;eof\</span>`],
]) {
	test(`preserves whitespace and EOF (${JSON.stringify(source)})`, () => {
		assert.equal(highlighter.highlight(source, {language: 'soml'}).value, expected);
	});
}

for (const [quote, escapedQuote] of [['\'', '&#x27;'], ['"', '&quot;']]) {
	test(`${quote} block delimiter length resets between calls`, () => {
		const unfinished = `${quote.repeat(4)}\n${quote.repeat(3)}`;
		const complete = `${quote.repeat(3)}\n${quote.repeat(3)}\nafter: true`;
		const expectedAfter = '\n<span class="hljs-attr">after</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>';
		assert.equal(highlighter.highlight(unfinished, {language: 'soml'}).value, `<span class="hljs-string">${escapedQuote.repeat(4)}\n${escapedQuote.repeat(3)}</span>`);
		assert.equal(highlighter.highlight(complete, {language: 'soml'}).value, `<span class="hljs-string">${escapedQuote.repeat(3)}\n${escapedQuote.repeat(3)}</span>${expectedAfter}`);
	});
}
