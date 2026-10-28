/*
Grammar: SOML
Description: A config format for humans. JSON without the noise, with comments.
Category: config
Website: https://soml.sh
*/

export default function soml(hljs) {
	const {regex, END_SAME_AS_BEGIN: endSameAsBegin} = hljs;
	const ESCAPE = {begin: /\\[^\n]/v, relevance: 0};

	const COMMENTS = {
		scope: 'comment',
		variants: [
			{
				begin: /#/v,
				end: /(?=\n)/v,
			},
			{
				begin: /\/\*/v,
				end: /\*\//v,
			},
		],
	};

	// Digit runs: no leading zeros, `_` separators only between two digits.
	const DIGITS = '(?:0|[1-9](?:_?[0-9])*)';
	const FRACTION = String.raw`(?:\.[0-9](?:_?[0-9])*)?`;
	const EXPONENT = '(?:e(?:0|-?[1-9](?:_?[0-9])*))?';

	// Avoid rescanning every suffix of an unfinished token.
	const TOKEN_START = /(?<![\w+\-.])/v;

	// A number must end before any scalar character or ':', so numeric keys stay keys.
	const NOT_A_KEY = /(?![\w+\-.:])/v;

	// Order matters: radix prefixes before decimals, and `ms`, `us`, `ns` before `m`, `s`.
	const UNIT = '(?:ms|us|ns|h|m|s)';
	const DATE = '[0-9]{4}-[0-9]{2}-[0-9]{2}';
	const DURATION_PART = `${DIGITS}${FRACTION}${UNIT}`;
	const SPECIAL_NUMBER_PATTERN = regex.either(
		// 2026-09-19T14:00:00Z, with an optional fraction and a `Z` or ±HH:MM offset
		String.raw`${DATE}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{1,9})?(?:Z|[+-][0-9]{2}:[0-9]{2})`,
		// Calendar dates carry no time or offset.
		DATE,
		// 30s, 1h30m, 1.5s, -5m
		`-?(?:${DURATION_PART})+`,
		'0x[0-9A-F](?:_?[0-9A-F])*',
		'0o[0-7](?:_?[0-7])*',
		'0b[01](?:_?[01])*',
		'-?infinity',
	);

	const NUMBER = {
		scope: 'number',
		variants: [
			{match: `${TOKEN_START.source}${SPECIAL_NUMBER_PATTERN}${NOT_A_KEY.source}`},
			{
				// Every decimal float and int: the int-part covers plain ints
				match: `${TOKEN_START.source}-?${DIGITS}${FRACTION}${EXPONENT}${NOT_A_KEY.source}`,
				relevance: 0,
			},
		],
	};

	const STRINGS = {
		scope: 'string',
		relevance: 0,
		variants: [
			endSameAsBegin({
				// A block of single quotes is literal: no escapes. The opener must end its line, and the closer must start one.
				begin: /(?<!')(?<literalDelimiter>'{3,})(?=\n)/v,
				end: /\n[\t ]*(?<literalDelimiter>'{3,})(?!')/v,
				relevance: 10,
			}),
			endSameAsBegin({
				// A block of double quotes has the same escapes as "..."
				begin: /(?<!")(?<escapedDelimiter>"{3,})(?=\n)/v,
				end: /\n[\t ]*(?<escapedDelimiter>"{3,})(?!")/v,
				relevance: 10,
				contains: [ESCAPE],
			}),
			{
				// '...' is literal, so a \ is just a backslash
				begin: /'/v,
				end: /'|(?=\n)/v,
			},
			{
				// "..." has the escapes \\ \" \n \t and \u{…}
				begin: /"/v,
				end: /"|(?=\n)/v,
				contains: [ESCAPE],
			},
		],
	};

	const KEY = regex.either(
		String.raw`${TOKEN_START.source}[\w-]+`,
		/'[^\n']*'/v,
		/"(?:\\[^\n]|[^\n"\\])*"/v,
	);

	return {
		name: 'SOML',
		keywords: {
			$pattern: /[\w+\-.]+/v,
			literal: 'true false null',
		},
		contains: [
			COMMENTS,
			NUMBER,
			{
				// Before the strings, so a quoted key wins over a string: a value is never followed by ':'.
				match: `${KEY}(?=:)`,
				scope: 'attr',
			},
			STRINGS,
			{
				match: /[,:\[\]\{\}]/v,
				scope: 'punctuation',
				relevance: 0,
			},
		],
	};
}
