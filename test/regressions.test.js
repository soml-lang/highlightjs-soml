import {test} from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js/lib/core';
import soml from 'highlightjs-soml';

hljs.debugMode();
hljs.registerLanguage('soml', soml);

function highlight(source) {
	return hljs.highlight(source, {language: 'soml'}).value;
}

for (const [quote, escapedQuote] of [['\'', '&#x27;'], ['"', '&quot;']]) {
	test(`an unfinished ${quote} string does not consume the next entry`, () => {
		assert.equal(
			highlight(`${quote}unfinished\nafter: true`),
			`<span class="hljs-string">${escapedQuote}unfinished</span>\n<span class="hljs-attr">after</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>`,
		);
	});

	test(`a ${quote} key cannot span LF`, () => {
		assert.equal(highlight(`${quote}unfinished\n${quote}: true`), `<span class="hljs-string">${escapedQuote}unfinished</span>\n<span class="hljs-string">${escapedQuote}: true</span>`);
	});
}

test('a backslash cannot continue a string or key onto the next line', () => {
	assert.equal(
		highlight('"unfinished\\\n"after": true'),
		'<span class="hljs-string">&quot;unfinished\\</span>\n<span class="hljs-attr">&quot;after&quot;</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>',
	);
});

for (const separator of ['\u{2028}', '\u{2029}']) {
	for (const [quote, escapedQuote] of [['\'', '&#x27;'], ['"', '&quot;']]) {
		test(`a ${quote} string and key may contain ${separator.codePointAt(0).toString(16)}`, () => {
			const value = `before${separator}after`;
			const quoted = `${escapedQuote}${value}${escapedQuote}`;
			assert.equal(highlight(`${quote}${value}${quote}`), `<span class="hljs-string">${quoted}</span>`);
			assert.equal(highlight(`${quote}${value}${quote}: 1`), `<span class="hljs-attr">${quoted}</span><span class="hljs-punctuation">:</span> <span class="hljs-number">1</span>`);
		});
	}

	test(`only LF ends a line comment with ${separator.codePointAt(0).toString(16)}`, () => {
		const comment = `# comment${separator}still a comment: 1`;
		const expectedComment = `<span class="hljs-comment">${comment}</span>`;
		const expectedEntry = '<span class="hljs-attr">after</span><span class="hljs-punctuation">:</span> <span class="hljs-number">2</span>';
		assert.equal(highlight(`${comment}\nafter: 2`), `${expectedComment}\n${expectedEntry}`);
	});

	test(`only LF starts a block string closer with ${separator.codePointAt(0).toString(16)}`, () => {
		const source = `value: '''\n\tx${separator}''' y\n\t'''`;
		const prefix = '<span class="hljs-attr">value</span><span class="hljs-punctuation">:</span> ';
		const expected = `${prefix}<span class="hljs-string">&#x27;&#x27;&#x27;\n\tx${separator}&#x27;&#x27;&#x27; y\n\t&#x27;&#x27;&#x27;</span>`;
		assert.equal(highlight(source), expected);
	});
}

for (const key of ['404', '30s', '1h30m', '0xFF', '0o644', '0b1010', '-infinity', '2026-09-19T14', '1_000', '-0xFF', 'infinity', 'true', '1'.repeat(10_000)]) {
	test(`value-shaped key stays an attribute (${key.slice(0, 30)})`, () => {
		assert.equal(highlight(`${key}: true`), `<span class="hljs-attr">${key}</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>`);
	});
}

for (const duration of ['1h', '30m', '90s', '500ms', '250us', '10ns', '1h30m', '1.5h', '-5m', '1_000s', '1h2m3s4ms5us6ns', '1h0.5m', '0.0000000001h']) {
	test(`duration is highlighted as a number (${duration})`, () => {
		assert.equal(highlight(duration), `<span class="hljs-number">${duration}</span>`);
	});
}

for (const number of ['0e0', '-0.0', '-0e0', '1_000.2_5e-1_0', '0xDE_AD', '0o0_7', '0b00_11']) {
	test(`number with separators or zero components is highlighted (${number})`, () => {
		assert.equal(highlight(number), `<span class="hljs-number">${number}</span>`);
	});
}

for (const token of [
	'1__2',
	'1_',
	'_1',
	'00',
	'01',
	'0x',
	'0x_FF',
	'0x1f',
	'0XFF',
	'-0xFF',
	'-0o644',
	'-0b1',
	'1E5',
	'1e00',
	'1e-0',
	'1e',
	'1d',
	'0b2',
	'0o8',
	'infinityx',
	'Infinity',
	'1.2.3',
	'.5',
	'+1',
	'1e+5',
	'1.',
	'1.2x',
	'1.5sx',
]) {
	test(`invalid number is not highlighted (${token})`, () => {
		assert.equal(highlight(token), token);
	});
}

for (const word of ['trueish', 'untrue', 'nullx', 'falsey', 'TRUE', 'Null', 'true-false', '-true', 'null-value', '1true', 'true_']) {
	test(`keyword lookalike is not highlighted (${word})`, () => {
		assert.equal(highlight(word), word);
	});
}

for (const date of ['0001-01-01', '9999-12-31', '1582-10-10', '2011-12-30', '2000-02-29', '2026-11-01']) {
	test(`a date is highlighted as one number (${date})`, () => {
		const highlighted = `<span class="hljs-number">${date}</span>`;
		assert.equal(highlight(date), highlighted);
		assert.equal(highlight(`a:${date}\nb: true`), `<span class="hljs-attr">a</span><span class="hljs-punctuation">:</span>${highlighted}\n<span class="hljs-attr">b</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>`);
		assert.equal(highlight(`[${date}]`), `<span class="hljs-punctuation">[</span>${highlighted}<span class="hljs-punctuation">]</span>`);
		assert.equal(highlight(`${date}: true`), `<span class="hljs-attr">${date}</span><span class="hljs-punctuation">:</span> <span class="hljs-literal">true</span>`);
	});
}

for (const token of ['2026-11-01T', '2026-11-01Z', '2026-11-01foo', '2026-11-01_', '2026-11-010', '+2026-11-01', '-2026-11-01']) {
	test(`a date prefix is not highlighted (${token})`, () => {
		assert.equal(highlight(token), token);
	});
}
