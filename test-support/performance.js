import assert from 'node:assert/strict';
import hljs from 'highlight.js/lib/core';
import soml from 'highlightjs-soml';

hljs.debugMode();
hljs.registerLanguage('soml', soml);

function highlight(source) {
	return hljs.highlight(source, {language: 'soml'}).value;
}

for (const source of [
	'a'.repeat(200_000),
	'2026-11-01' + 'x'.repeat(200_000),
	'1'.repeat(200_000) + 'x',
	'1.' + '2'.repeat(200_000) + 'x',
	'1h'.repeat(100_000) + 'x',
	'1_'.repeat(100_000) + 'x',
	'0x' + 'F_'.repeat(100_000) + 'x',
	'1e' + '1'.repeat(200_000) + 'x',
	'1ms'.repeat(70_000) + 'x',
	'1.0ms'.repeat(40_000) + 'x',
	'1.' + '0_'.repeat(100_000) + 'x',
	'1e-' + '1_'.repeat(100_000) + 'x',
]) {
	assert.equal(highlight(source), source);
}

const key = 'a'.repeat(200_000);
assert.equal(highlight(key + ':'), '<span class="hljs-attr">' + key + '</span><span class="hljs-punctuation">:</span>');

for (const quote of ['\'', '"']) {
	const source = quote + 'a'.repeat(200_000) + quote;
	const escapedQuote = quote === '\'' ? '&#x27;' : '&quot;';
	const expected = '<span class="hljs-string">' + escapedQuote + 'a'.repeat(200_000) + escapedQuote + '</span>';
	assert.equal(highlight(source), expected);

	const backslashes = '\\'.repeat(200_000);
	assert.equal(highlight(quote + backslashes + quote), '<span class="hljs-string">' + escapedQuote + backslashes + escapedQuote + '</span>');

	const rejectedDelimiter = quote.repeat(100_000) + 'x';
	const emptyString = '<span class="hljs-string">' + escapedQuote + escapedQuote + '</span>';
	assert.equal(highlight(rejectedDelimiter), emptyString.repeat(50_000) + 'x');

	const delimiter = quote.repeat(10_000);
	const block = delimiter + '\n' + quote.repeat(9999) + '\n' + quote.repeat(10_001) + '\n' + delimiter;
	const expectedBlock = escapedQuote.repeat(10_000) + '\n' + escapedQuote.repeat(9999) + '\n' + escapedQuote.repeat(10_001) + '\n' + escapedQuote.repeat(10_000);
	assert.equal(highlight(block), '<span class="hljs-string">' + expectedBlock + '</span>');

	const mismatchedClosers = quote.repeat(4) + '\n' + (quote.repeat(3) + '\n').repeat(50_000) + quote.repeat(4);
	const expectedClosers = escapedQuote.repeat(4) + '\n' + (escapedQuote.repeat(3) + '\n').repeat(50_000) + escapedQuote.repeat(4);
	assert.equal(highlight(mismatchedClosers), '<span class="hljs-string">' + expectedClosers + '</span>');

	const indentation = ' \t'.repeat(100_000);
	const indentedBlock = quote.repeat(3) + '\n' + indentation + 'x\n' + quote.repeat(3);
	const expectedIndentedBlock = escapedQuote.repeat(3) + '\n' + indentation + 'x\n' + escapedQuote.repeat(3);
	assert.equal(highlight(indentedBlock), '<span class="hljs-string">' + expectedIndentedBlock + '</span>');
}

const escapedQuotes = String.raw`\"`.repeat(100_000);
const escapedQuoteMarkup = String.raw`\&quot;`.repeat(100_000);
const quoted = `"${escapedQuotes}"`;
const quotedMarkup = `&quot;${escapedQuoteMarkup}&quot;`;
assert.equal(highlight(quoted), `<span class="hljs-string">${quotedMarkup}</span>`);
assert.equal(highlight(`${quoted}:`), `<span class="hljs-attr">${quotedMarkup}</span><span class="hljs-punctuation">:</span>`);
assert.equal(highlight(`"${escapedQuotes}`), `<span class="hljs-string">&quot;${escapedQuoteMarkup}</span>`);

const spaces = ' '.repeat(200_000);
for (const source of ['#' + spaces, '/*' + spaces + '*/']) {
	assert.equal(highlight(source), '<span class="hljs-comment">' + source + '</span>');
}
