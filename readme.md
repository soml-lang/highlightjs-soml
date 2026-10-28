# highlightjs-soml

> [SOML](https://soml.sh) grammar for [highlight.js](https://github.com/highlightjs/highlight.js)

SOML is a config format that is pleasant to write and easy to read: JSON without the noise, and with comments.

## Install

```sh
npm install highlightjs-soml
```

Requires [`highlight.js`](https://github.com/highlightjs/highlight.js) 11.12 or later.

The package is ESM-only and requires no build step.

## Usage

### Node.js or bundler

```js
import hljs from 'highlight.js/lib/core';
import soml from 'highlightjs-soml';

hljs.registerLanguage('soml', soml);

hljs.highlight(text, {language: 'soml'});
```

### Browser

```html
<script type="module">
import hljs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/es/highlight.min.js';
import soml from 'https://cdn.jsdelivr.net/npm/highlightjs-soml/index.js';

hljs.registerLanguage('soml', soml);
hljs.highlightAll();
</script>
```
