import {expectTypeOf, expectError} from 'nz';
import hljs, {type LanguageDetail, type LanguageFn} from 'highlight.js';
import hljsCore from 'highlight.js/lib/core';
import soml from './index.js';

expectTypeOf(soml).toBeAssignableTo<LanguageFn>();
expectTypeOf(soml(hljs)).toBe<LanguageDetail>();
hljs.registerLanguage('soml', soml);
expectTypeOf(soml(hljsCore)).toBe<LanguageDetail>();
hljsCore.registerLanguage('soml', soml);
expectError(soml());
expectError(soml({}));
