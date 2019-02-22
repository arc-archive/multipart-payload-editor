[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/multipart-payload-editor.svg)](https://www.npmjs.com/package/@advanced-rest-client/multipart-payload-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/multipart-payload-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/multipart-payload-editor)

# multipart-payload-editor

An AMF powered multipart payload editor for the HTTP request editor.

```html
<multipart-payload-editor></multipart-payload-editor>
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/multipart-payload-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/multipart-payload-editor/multipart-payload-editor.js';
    </script>
  </head>
  <body>
    <multipart-payload-editor></multipart-payload-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/api-url-data-model/api-url-data-model.js';
import '@advanced-rest-client/multipart-payload-editor/multipart-payload-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <multipart-payload-editor></multipart-payload-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/multipart-payload-editor
cd multipart-payload-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
