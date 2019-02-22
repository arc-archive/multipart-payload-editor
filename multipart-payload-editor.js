/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { PolymerElement } from '../../@polymer/polymer/polymer-element.js';

import '../../@polymer/polymer/lib/elements/dom-if.js';
import '../../@polymer/polymer/lib/elements/dom-repeat.js';
import '../../arc-icons/arc-icons.js';
import '../../@polymer/iron-form/iron-form.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-spinner/paper-spinner.js';
import '../../@polymer/paper-toast/paper-toast.js';
import '../../api-form-mixin/api-form-mixin.js';
import '../../api-form-mixin/api-form-styles.js';
import '../../multipart-payload-transformer/multipart-payload-transformer.js';
import { IronValidatableBehavior } from '../../@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '../../clipboard-copy/clipboard-copy.js';
import '../../@polymer/prism-element/prism-highlighter.js';
import '../../@polymer/prism-element/prism-theme-default.js';
import '../../prism-common/prism-http-import.js';
import './multipart-text-form-item.js';
import './multipart-file-form-item.js';
import { mixinBehaviors } from '../../@polymer/polymer/lib/legacy/class.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="multipart-payload-editor">
  <template strip-whitespace="">
    <style include="prism-theme-default"></style>
    <style include="api-form-styles"></style>
    <style>
    :host {
      display: block;
      @apply --multipart-payload-editor;
    }

    [hidden] {
      display: none !important;
    }

    .form-item {
      @apply --layout-horizontal;
      margin: 8px 0;
    }

    .delete-action {
      display: block;
      margin-top: 20px;
    }

    .form-item:not([data-file]) .delete-action {
      margin-top: 42px;
    }

    multipart-text-form-item,
    multipart-file-form-item {
      margin-bottom: 8px;
    }

    code {
      @apply --arc-font-code1;
      white-space: pre-line;
      word-break: break-all;
      overflow: auto;
      @apply --multipart-payload-editor-code-preview;
    }

    .editor-actions {
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --view-action-bar;
      @apply --multipart-payload-editor-action-bar;
    }

    paper-icon-button[active] {
      background-color: var(--body-editor-panel-button-active-background-color, #e0e0e0);
      border-radius: 50%;
      @apply --body-editor-panel-button-active;
    }
    </style>
    <template is="dom-if" if="[[hasFormDataSupport]]">
      <div class="editor-actions">
        <paper-icon-button id="previewIcon" icon="[[_computeToggleIcon(previewOpened)]]" class="action-icon" toggles="" active="{{previewOpened}}" disabled="[[generatingPreview]]" title="Toggles generated payload message preview"></paper-icon-button>
        <paper-icon-button id="copyIcon" icon="arc:content-copy" class="action-icon" on-tap="_copyToClipboard" disabled="[[generatingPreview]]" hidden\$="[[!previewOpened]]" title="Copy payload message"></paper-icon-button>
        <paper-spinner alt="Loading preview" active="[[generatingPreview]]"></paper-spinner>
      </div>
    </template>
    <section hidden\$="[[previewOpened]]">
      <iron-form>
        <form enctype="multipart/form-data" method="post">
          <template is="dom-repeat" id="list" items="{{model}}" observe="value">
            <div class="form-item" data-file\$="[[item.schema.isFile]]">
              <template is="dom-if" if="[[item.schema.isFile]]">
                <multipart-file-form-item name="{{item.name}}" value="{{item.value}}" model="[[item]]" required="" auto-validate=""></multipart-file-form-item>
              </template>
              <template is="dom-if" if="[[!item.schema.isFile]]">
                <multipart-text-form-item has-form-data="[[hasFormDataSupport]]" name="{{item.name}}" value="{{item.value}}" type="{{item.contentType}}" model="[[item]]" required="" auto-validate=""></multipart-text-form-item>
              </template>
              <span class="delete-action">
                <paper-icon-button title="Remove parameter" class="action-icon delete-icon" icon="arc:remove-circle-outline" on-tap="_removeCustom"></paper-icon-button>
              </span>
            </div>
          </template>
        </form>
      </iron-form>
      <div class="add-actions">
        <paper-button on-tap="addFile" class="action-button">Add file part</paper-button><paper-button on-tap="addText" class="action-button">Add text part</paper-button>
      </div>
    </section>
    <section hidden\$="[[!previewOpened]]">
      <code></code>
    </section>
    <prism-highlighter></prism-highlighter>
    <multipart-payload-transformer></multipart-payload-transformer>
    <clipboard-copy content="[[messagePreview]]"></clipboard-copy>
    <paper-toast horizontal-align="right"></paper-toast>
  </template>
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
/**
 * Multipart payload editor for ARC/API Console body editor.
 *
 * On supported browsers (full support for FormData, Iterator and ArrayBuffer) it will render a
 * UI controls to generate payload message preview.
 *
 * It produces a FormData object that can be used in XHR / Fetch or transformed to ArrayBuffer to be
 * used in socket connection.
 *
 * ### Example
 * ```html
 * <multipart-payload-editor value="{{form}}"></multipart-payload-editor>
 * ```
 *
 * ## Data model from FormData
 *
 * The element creates a data model for the form view from FormData object.
 * The limitation of this solution is that the information about initial part type
 * is lost. In case when the user specified the part as a text part but also added
 * part content type it will be recognized as the file part.
 *
 * Note: this only works in browsers that support full FormData spec which rules
 * out any Microsoft product. **You have to include polyfills for the FormData.**
 *
 * ### Styling
 *
 * `<multipart-payload-editor>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--multipart-payload-editor` | Mixin applied to the element | `{}`
 * `--multipart-payload-editor-code-preview` | Mixin applied to a code preview element | `{}`
 * `--view-action-bar` | Theme mixin, applied to the content action bar | `{}`
 * `--multipart-payload-editor-action-bar` | Mixin applied to the content action bar | `{}`
 * `--body-editor-panel-button-active-background-color` | Background color of the active content action button | `#e0e0e0`
 * `--body-editor-panel-button-active` | Mixin applied to active content action button | `{}`
 * `--content-action-icon-color` | Color of the content action icon | `rgba(0, 0, 0, 0.74)`
 * `--content-action-icon-color-hover` | Color of the content action icon when hovered | `--accent-color` or `rgba(0, 0, 0, 0.74)`
 * `--inline-documentation-color` | Color of the description text from a RAML type. | `rgba(0, 0, 0, 0.87)`
 * `--from-row-action-icon-color` | Color of the icon buttons next to the input fields | `--icon-button-color` or `rgba(0, 0, 0, 0.74)`
 * `--from-row-action-icon-color-hover` | Color of the icon buttons next to the input fields when hovering | `--accent-color` or `rgba(0, 0, 0, 0.74)`,
 * `--multipart-payload-editor-file-trigger-color` | Color of the file dialog trigger button. | `--accent-color` or `#FF5722`
 *
 * This element also inherits styles from
 * `advanced-rest-client/api-form-mixin/api-form-styles.html` element to
 * style form controls.
 *
 * @customElement
 * @polymer
 * @demo demo/simple.html Simple usage
 * @demo demo/raml.html With AMF model from RAML file
 * @appliesMixin Polymer.IronValidatableBehavior
 * @appliesMixin ArcBehaviors.ApiFormMixin
 * @memberof ApiComponents
 */
class MultipartPayloadEditor extends mixinBehaviors([IronValidatableBehavior], ArcBehaviors.ApiFormMixin(PolymerElement)) {
  static get is() { return 'multipart-payload-editor'; }
  static get properties() {
    return {
      /**
       * Value of this form
       *
       * @type {FormData}
       */
      value: {
        type: Object,
        notify: true,
        observer: '_valueChanged'
      },
      /**
       * True if the browser has native FormData support.
       */
      hasFormDataSupport: {
        type: Boolean,
        value: function() {
          try {
            const fd = new FormData();
            fd.append('test', new Blob(['.'], {type: 'image/jpg'}), 'test.jpg');
            return ('entries' in fd);
          } catch (e) {
            return false;
          }
        }
      },
      // true if the message preview is opened
      previewOpened: {
        type: Boolean,
        value: false,
        observer: '_previewOpenedChanged'
      },
      // true if the transformer is generating the message
      generatingPreview: Boolean,
      // Generated body message preview
      messagePreview: String
    };
  }

  static get observers() {
    return [
      '_modelChanged(model.*)'
    ];
  }

  ready() {
    super.ready();
    if (!this.model) {
      this.addFile();
    }
  }
  /**
   * Appends new file form row.
   * This changes `model`.
   */
  addFile() {
    this.addCustom('type', {
      inputLabel: 'Property value'
    });
    const index = this.model.length - 1;
    this.set(`model.${index}.schema.isFile`, true);
    this.set(`model.${index}.schema.type`, 'file');
  }
  /**
   * Appends empty text field to the form.
   * This changes `model`.
   */
  addText() {
    this.addCustom('type', {
      inputLabel: 'Property value'
    });
    const index = this.model.length - 1;
    this.set(`model.${index}.schema.isFile`, false);
    this.set(`model.${index}.schema.type`, 'string');
    if (this.hasFormDataSupport) {
      this.set(`model.${index}.contentType`, '');
    }
  }
  /**
   * Handler for value change.
   * If the element is opened then it will fire change event.
   */
  _valueChanged(value) {
    if (!(value instanceof FormData)) {
      return;
    }
    const currentModel = this.model;
    if (currentModel) {
      if (!this._modelAndValueMatch(currentModel, value)) {
        this._restoreFormData(value);
        return;
      }
    } else if (value) {
      this._restoreFormData(value);
      return;
    }
  }
  /**
   * Transforms FormData into the data model.
   * Sets new model data.
   *
   * @param {FormData} data Form data to be restored.
   */
  _restoreFormData(data) {
    if (!this.hasFormDataSupport) {
      return;
    }
    let textParts;
    if (data._arcMeta && data._arcMeta.textParts) {
      textParts = data._arcMeta.textParts;
    }
    const it = data.entries();
    return this._modelForParts(it, textParts)
    .then((model) => {
      this._cancelModelChange = true;
      this.set('model', model);
      this._cancelModelChange = false;
    });
  }
  /**
   * @param {Iterator} entries
   * @param {Array} textParts
   * @param {Array} result
   * @return {Promise<Array>}
   */
  _modelForParts(entries, textParts, result) {
    result = result || [];
    const item = entries.next();
    if (item.done) {
      return Promise.resolve(result);
    }
    const part = item.value;
    let modelItem = {
      name: part[0]
    };
    let restoreBlobValue = false;
    if (typeof part[1] === 'string') {
      modelItem.type = 'text';
    } else {
      if (textParts && textParts.indexOf(modelItem.name) !== -1) {
        modelItem.type = 'text';
        restoreBlobValue = true;
      } else {
        modelItem.type = 'file';
      }
    }
    let promise;
    if (restoreBlobValue) {
      promise = this._blobToString(part[1]);
    } else {
      promise = Promise.resolve({
        result: part[1]
      });
    }
    return promise.then((value) => {
      modelItem.value = value.result;
      modelItem = this._createModelObject(modelItem, {});
      if (!modelItem.schema) {
        modelItem.schema = {};
      }
      modelItem.schema.isFile = modelItem.type === 'file' ? true : false;
      if (modelItem.schema.isFile) {
        modelItem.value = part[1];
      }
      if (restoreBlobValue) {
        modelItem.contentType = value.type;
      }
      result.push(modelItem);
      return this._modelForParts(entries, textParts, result);
    });
  }
  /**
   * It dispatches `api-property-model-build` custom event that is handled by
   * `api-view-model-transformer` to build model item.
   * This assumes that the transformer element is already in the DOM.
   *
   * @param {Object} defs Defaults for model
   * @return {Object} Tranformed object.
   */
  _createModelObject(defs) {
    const e = new CustomEvent('api-property-model-build', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: defs
    });
    this.dispatchEvent(e);
    return e.detail;
  }
  /**
   * Transforms `Blob` to string.
   *
   * @param {Blob} blob A blob to read.
   * @return {Promise<String>} Read content.
   */
  _blobToString(blob) {
    return new Promise(function(resolve) {
      const reader = new FileReader();
      reader.addEventListener('loadend', function(e) {
        resolve({
          result: e.target.result,
          type: blob.type
        });
      });
      reader.addEventListener('error', function() {
        resolve({
          result: 'Unable to restore part value',
          type: ''
        });
      });
      reader.readAsText(blob);
    });
  }

  /**
   * Tests if current model and FormData object represent the same form data.
   *
   * @param {Array} model Model to test
   * @param {FormData} value Form data with values
   * @return {Boolean} True if model represents data in FormData object
   */
  _modelAndValueMatch(model, value) {
    if (!this.hasFormDataSupport) {
      return true;
    }
    if ((!model || !model.length) && value) {
      return false;
    }
    if (!value) {
      return true;
    }
    const it = value.keys();
    const modelSize = model.length;
    while (true) {
      const item = it.next();
      if (item.done) {
        return true;
      }
      let fasItem = false;
      for (let i = 0; i < modelSize; i++) {
        if (model[i].name === item.value) {
          fasItem = true;
          break;
        }
      }
      if (!fasItem) {
        return false;
      }
    }
  }
  // Generates a message and displays highlighted content of the message.
  _previewOpenedChanged(opened) {
    if (!opened) {
      return;
    }
    if (!this.value) {
      const toast = this.shadowRoot.querySelector('paper-toast');
      toast.text = 'Add a valid form items first';
      toast.opened = true;
      this.previewOpened = false;
      return;
    }
    this._generatePreview()
    .then((preview) => {
      if (!preview) {
        this.previewOpened = false;
        return;
      }
      const e = new CustomEvent('syntax-highlight', {
        bubbles: true,
        composed: true,
        detail: {
          code: preview,
          lang: 'http'
        }
      });
      this.dispatchEvent(e);
      this.shadowRoot.querySelector('code').innerHTML = e.detail.code || preview;
    });
  }

  _computeToggleIcon(previewOpened) {
    return previewOpened ? 'arc:visibility-off' : 'arc:visibility';
  }

  /**
   * Called when the model chage. Regenerates the FormData object.
   *
   * @param {Object} record Polymer change record
   */
  _modelChanged(record) {
    if (this._cancelModelChange) {
      return;
    }
    if (!record || !record.path) {
      return;
    }
    if (record.path === 'model.splices') {
      return;
    }
    const formData = this.createFormData(record.base);
    this.set('value', formData);
  }
  /**
   * Generates FormData from the model.
   * For the browsers with full FormData support it will generate Form data object from form
   * element. It means that it will have only basic support.
   * For browsers with full FormData support it will contain all properties (including
   * mime types).
   *
   * @param {Array} model View data model.
   */
  createFormData(model) {
    if (this.hasFormDataSupport) {
      return this._getFormData(model);
    } else {
      return this._getLegacyFormData(model);
    }
  }
  /**
   * Generates the FormData object from the model instead of the form.
   *
   * @param {Array} model The model to generate form data from.
   * @return {FormData|undefined} Form data from model or undefined if model is empty.
   */
  _getFormData(model) {
    if (!model || !model.length) {
      return;
    }
    const fd = new FormData();
    let hasValue = false;
    model.forEach((item) => {
      if (!item.name) {
        return;
      }
      if (item.schema.isFile) {
        if (!item.value) {
          return;
        }
        fd.append(item.name, item.value);
        hasValue = true;
      } else {
        if (item.contentType) {
          var blob = new Blob([item.value], {type: item.contentType});
          fd.append(item.name, blob);
          if (!fd._arcMeta) {
            fd._arcMeta = {};
          }
          if (!fd._arcMeta.textParts) {
            fd._arcMeta.textParts = [];
          }
          fd._arcMeta.textParts.push(item.name);
        } else {
          fd.append(item.name, item.value);
        }
        hasValue = true;
      }
    });
    return hasValue ? fd : undefined;
  }
  /**
   * Returns a FormData object depending if current form has any value.
   * Text items can be empty.
   *
   * @param {Array} model The model to generate form data from.
   * @return {FormData|undefined} Form data from model or undefined if model
   * is empty.
   */
  _getLegacyFormData(model) {
    if (!model || !model.length) {
      return;
    }
    let hasValue = false;
    for (var i = 0, len = model.length; i < len; i++) {
      if (model[i].value) {
        hasValue = true;
      }
    }
    return hasValue ? new FormData(this._getForm()) : undefined;
  }
  /**
   * Generates a preview message from the FormData object.
   *
   * @return {Promise} A promise fulfilled with the content. Content can be undefined
   * if message couldn't be generated because of lack of support.
   */
  _generatePreview() {
    this.set('messagePreview', undefined);
    this.set('generatingPreview', true);
    const transformer = this.shadowRoot.querySelector('multipart-payload-transformer');
    transformer.formData = this.value;
    return transformer.generatePreview()
    .then((preview) => {
      this.set('generatingPreview', false);
      this.set('messagePreview', preview);
      return preview;
    })
    .catch((cause) => {
      this.set('generatingPreview', false);
      const toast = this.shadowRoot.querySelector('paper-toast');
      toast.text = cause.message;
      toast.opened = true;
    });
  }
  // Handler for copy to clipboard click.
  _copyToClipboard() {
    const elm = this.shadowRoot.querySelector('clipboard-copy');
    if (elm.copy()) {
      this.shadowRoot.querySelector('#copyIcon').icon = 'arc:done';
    } else {
      this.shadowRoot.querySelector('#copyIcon').icon = 'arc:error';
      const toast = this.shadowRoot.querySelector('paper-toast');
      toast.text = 'Copy command is disabled in your browser.';
      toast.opened = true;
    }
    if (this.__copyButtonAsync) {
      clearTimeout(this.__copyButtonAsync);
    }
    this.__copyButtonAsync = setTimeout(() => {
      this.shadowRoot.querySelector('#copyIcon').icon = 'arc:content-copy';
      this.__copyButtonAsync = undefined;
    }, 1000);
  }
}
window.customElements.define(MultipartPayloadEditor.is, MultipartPayloadEditor);