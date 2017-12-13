[![Build Status](https://travis-ci.org/advanced-rest-client/multipart-payload-editor.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/multipart-payload-editor)  

# multipart-payload-editor

Multipart payload editor for ARC/API Console body editor.

On supported browsers (full support for FormData, Iterator and ArrayBuffer) it will render a
UI controls to generate payload message preview.

It produces a FormData object that can be used in XHR / Fetch or transformed to ArrayBuffer to be
used in socket connection.

### Example
```
<multipart-payload-editor value="{{form}}"></multipart-payload-editor>
```

## Data model from FormData

The element creates a data model for the form view from FormData object.
The limitation of this solution is that the information about initial part type
is lost. In case when the user specified the part as a text part but also added
part content type it will be recognized as the file part.

Note: this only works in browsers that support full FormData spec which rules
out any Microsoft product. You have to include polyfills for the FormData.

### Styling
`<multipart-payload-editor>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--multipart-payload-editor` | Mixin applied to the element | `{}`
`--multipart-payload-editor-code-preview` | Mixin applied to a code preview element | `{}`
`--view-action-bar` | Theme mixin, applied to the content action bar | `{}`
`--multipart-payload-editor-action-bar` | Mixin applied to the content action bar | `{}`
`--body-editor-panel-button-active-background-color` | Background color of the active content action button | `#e0e0e0`
`--body-editor-panel-button-active` | Mixin applied to active content action button | `{}`
`--content-action-icon-color` | Color of the content action icon | `rgba(0, 0, 0, 0.74)`
`--content-action-icon-color-hover` | Color of the content action icon when hovered | `--accent-color` or `rgba(0, 0, 0, 0.74)`
`--multipart-payload-editor-action-button` | Mixin applied to the "add action" button | `{}`
`--multipart-payload-editor-action-button-hover` | Mixin applied to the "add action" button when hovering | `{}`
`--multipart-payload-editor-action-button-color` | Color of the action button. | `--secondary-button-color` or `--accent-color`
`--multipart-payload-editor-action-button-color-hover` | Color of the action button when hovered | `--secondary-button-color` or `--accent-color`
`--multipart-payload-editor-action-button-background` | Background of the action button | `--secondary-button-background` or `#fff`
`--multipart-payload-editor-action-button-background-hover` | Background of the action button when hovered | `--secondary-button-background` or `#fff`
`--inline-documentation-color` | Color of the description text from a RAML type. | `rgba(0, 0, 0, 0.87)`
`--from-row-action-icon-color` | Color of the icon buttons next to the input fields | `--icon-button-color` or `rgba(0, 0, 0, 0.74)`
`--from-row-action-icon-color-hover` | Color of the icon buttons next to the input fields when hovering | `--accent-color` or `rgba(0, 0, 0, 0.74)`,
`--multipart-payload-editor-file-trigger-color` | Color of the file dialog trigger button. | `--accent-color` or `#FF5722`

