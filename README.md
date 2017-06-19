[![Build Status](https://travis-ci.org/advanced-rest-client/multipart-payload-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/multipart-payload-editor)  

# multipart-payload-editor

Multipart payload editor for ARC body editor.

On supported browsers (full support for FormData, Iterator and ArrayBuffer) it will render a
UI controls to generate payload message preview.

It produces a FormData object that can be used in XHR / Fetch or transformed to ArrayBuffer to be
used in socket connection.

### Example
```
<multipart-payload-editor value="{{form}}"></multipart-payload-editor>
```

### Styling
`<multipart-payload-editor>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--multipart-payload-editor` | Mixin applied to the element | `{}`
`--multipart-payload-editor-paper-fab-menu` | Mixin applied to paper-fab-menu | `{}`
`--multipart-payload-editor-code-preview` | Mixin applied to a code preview element | `{}`
`--view-action-bar` | Theme mixin, applied to the content action bar | `{}`
`--multipart-payload-editor-action-bar` | Mixin applied to the content action bar | `{}`
`--body-editor-panel-button-active-background-color` | Background color of the active content action button | `#e0e0e0`
`--body-editor-panel-button-active` | Mixin applied to active content action button | `{}`
`--content-action-icon-color` | Color of the content action icon | `rgba(0, 0, 0, 0.74)`
`--content-action-icon-color-hover` | Color of the content action icon when hovered | `--accent-color` or `rgba(0, 0, 0, 0.74)`

