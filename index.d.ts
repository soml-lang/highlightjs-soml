import type {HLJSApi, LanguageDetail} from 'highlight.js';

/**
SOML grammar for highlight.js.

@example
```
import hljs from 'highlight.js/lib/core';
import soml from 'highlightjs-soml';

hljs.registerLanguage('soml', soml);

hljs.highlight(text, {language: 'soml'});
```
*/
export default function soml(hljs: HLJSApi): LanguageDetail;
