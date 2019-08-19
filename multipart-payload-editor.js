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
import { html, css, LitElement } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import {ApiFormMixin} from '@api-components/api-form-mixin/api-form-mixin.js';
import formStyles from '@api-components/api-form-mixin/api-form-styles.js';
import prismStyles from '@advanced-rest-client/prism-highlight/prism-styles.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/iron-form/iron-form.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/multipart-payload-transformer/multipart-payload-transformer.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';

import '@polymer/prism-element/prism-import.js';
import '@polymer/prism-element/prism-highlighter.js';
import '@polymer/prism-element/prism-theme-default.js';
import 'prismjs/components/prism-http.js';

import './multipart-text-form-item.js';
import './multipart-file-form-item.js';
export let hasFormDataSupport;
try {
  const fd = new FormData();
  fd.append('test', new Blob(['.'], {type: 'image/jpg'}), 'test.jpg');
  hasFormDataSupport = ('entries' in fd);
} catch (e) {
  hasFormDataSupport = false;
}
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
 *
 * @customElement
 * @demo demo/index.html
 * @appliesMixin ValidatableMixin
 * @appliesMixin ApiFormMixin
 * @memberof ApiComponents
 */
class MultipartPayloadEditor extends ApiFormMixin(ValidatableMixin(LitElement)) {
  static get styles() {
    return [
      prismStyles,
      formStyles,
      css`:host {
        display: block;
      }

      [hidden] {
        display: none !important;
      }

      .form-item {
        display: flex;
        flex-direction: row;
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
        font-family: var(--arc-font-code-family);
        white-space: pre-line;
        word-break: break-all;
        overflow: auto;
      }

      .editor-actions {
        display: flex;
        flex-direction: row;
        align-items: center;
      }`
    ];
  }

  _previewTemplate(messagePreview) {
    return html`<code>${messagePreview}</code>`;
  }

  _formItemTemplate(item, index) {
    const {
      readOnly,
      disabled,
      legacy,
      outlined,
    } = this;
    return html`<div class="form-item" data-file="${item.schema.isFile}">
    ${item.schema.isFile ?
      html`<multipart-file-form-item
        data-index="${index}"
        .name="${item.name}"
        @name-changed="${this._nameChangeHandler}"
        .value="${item.value}"
        @value-changed="${this._valueChangeHandler}"
        .model="${item}"
        .outlined="${outlined}"
        .legacy="${legacy}"
        .readOnly="${readOnly}"
        .disabled=${disabled}
        ></multipart-file-form-item>` :
      html`<multipart-text-form-item
        .hasFormData="${hasFormDataSupport}"
        data-index="${index}"
        .name="${item.name}"
        @name-changed="${this._nameChangeHandler}"
        .value="${item.value}"
        @value-changed="${this._valueChangeHandler}"
        .type="${item.contentType}"
        @type-changed="${this._typeChangeHandler}"
        .model="${item}"
        .outlined="${outlined}"
        .legacy="${legacy}"
        .readOnly="${readOnly}"
        .disabled=${disabled}></multipart-text-form-item>`}

      <span class="delete-action">
        <anypoint-icon-button
          title="Remove this parameter"
          aria-label="Press to remove parameter ${item.name}"
          class="action-icon delete-icon"
          data-index="${index}"
          @click="${this._removeCustom}"
          slot="suffix"
          ?disabled="${readOnly || disabled}"
          ?outlined="${outlined}"
          ?legacy="${legacy}">
          <iron-icon icon="arc:remove-circle-outline"></iron-icon>
        </anypoint-icon-button>
      </span>
    </div>`;
  }

  _formTemplate() {
    const {
      readOnly,
      disabled,
    } = this;
    const model = this.model || [];
    return html`
      <iron-form>
        <form enctype="multipart/form-data" method="post">
          ${model.map((item, index) => this._formItemTemplate(item, index))}
        </form>
      </iron-form>
      <div class="add-actions">
        <anypoint-button
          class="action-button"
          @click="${this.addFile}"
          ?disabled="${disabled || readOnly}"
          emphasis="medium">Add file part</anypoint-button>
        <anypoint-button
          class="action-button"
          @click="${this.addText}"
          ?disabled="${disabled || readOnly}"
          emphasis="medium">Add text part</anypoint-button>
      </div>`;
  }

  render() {
    const {
      previewOpened,
      generatingPreview,
      messagePreview
    } = this;
    return html`
    ${hasFormDataSupport ? html`<div class="editor-actions">
      <anypoint-button
        part="content-action-button, code-content-action-button"
        class="action-button"
        data-action="copy"
        emphasis="medium"
        toggles
        .active="${previewOpened}"
        @active-changed="${this._previewHandler}"
        aria-label="Press to toggle payload preview"
        title="Toggles generated payload message preview"
        ?disabled="${generatingPreview}">Preview</anypoint-button>
      <anypoint-button
        part="content-action-button, code-content-action-button"
        class="action-button"
        data-action="copy"
        emphasis="medium"
        @click="${this._copyToClipboard}"
        aria-label="Press to copy payload to clipboard"
        title="Copy payload to clipboard"
        ?disabled="${generatingPreview}">Copy</anypoint-button>
      <paper-spinner alt="Loading preview" .active="${generatingPreview}"></paper-spinner>
    </div>` : undefined}

    <section>
    ${previewOpened ? this._previewTemplate(messagePreview) : this._formTemplate()}
    </section>

    <prism-highlighter></prism-highlighter>
    <multipart-payload-transformer></multipart-payload-transformer>
    <clipboard-copy .content="${messagePreview}"></clipboard-copy>
    <paper-toast horizontal-align="right"></paper-toast>`;
  }


  static get properties() {
    return {
      /**
       * Value of this form
       *
       * @type {FormData}
       */
      value: { type: Object },

      // true if the message preview is opened
      previewOpened: { type: Boolean },
      // true if the transformer is generating the message
      generatingPreview: { type: Boolean },
      // Generated body message preview
      messagePreview: { type: String },
      /**
       * Enables Anypoint legacy styling
       */
      legacy: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set all controls are disabled in the form
       */
      disabled: { type: Boolean }
    };
  }

  get model() {
    return this._model;
  }

  set model(value) {
    if (this._sop('model', value)) {
      this._notifyChanged('model', value);
      this.renderEmptyMessage = this._computeRenderEmptyMessage(this.allowCustom, value);
      this.hasOptional = this._computeHasOptionalParameters(this.allowHideOptional, value);
      this._modelChanged(value);
    }
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (this._sop('value', value)) {
      this._notifyChanged('value', value);
      this._valueChanged(value);
    }
  }

  get previewOpened() {
    return this._previewOpened;
  }

  set previewOpened(value) {
    if (this._sop('previewOpened', value)) {
      this._previewOpenedChanged(value);
    }
  }

  firstUpdated() {
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
    const item = this.model[index];
    item.schema.isFile = true;
    item.schema.type = 'file';
    this.requestUpdate();
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
    const item = this.model[index];
    item.schema.isFile = false;
    item.schema.type = 'string';
    if (hasFormDataSupport) {
      item.contentType = '';
    }
    this.requestUpdate();
  }
  /**
   * Handler for value change.
   * If the element is opened then it will fire change event.
   *
   * @param {FormData} value
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
   * @return {Promise}
   */
  async _restoreFormData(data) {
    if (!hasFormDataSupport) {
      return;
    }
    let textParts;
    if (data._arcMeta && data._arcMeta.textParts) {
      textParts = data._arcMeta.textParts;
    }
    const it = data.entries();
    const model = await this._modelForParts(it, textParts);
    this._cancelModelChange = true;
    this.model = model;
    this._cancelModelChange = false;
  }
  /**
   * @param {Iterator} entries
   * @param {Array} textParts
   * @param {Array} result
   * @return {Promise<Array>}
   */
  async _modelForParts(entries, textParts, result) {
    result = result || [];
    const item = entries.next();
    if (item.done) {
      return result;
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
    let value;
    if (restoreBlobValue) {
      value = await this._blobToString(part[1]);
    } else {
      value = {
        result: part[1]
      };
    }
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
    if (!hasFormDataSupport) {
      return true;
    }
    if ((!model || !model.length) && value) {
      return false;
    }
    if (!value) {
      return true;
    }
    const modelSize = model.length;
    const it = value.keys();
    const item = it.next();
    while (!item.done) {
      let hasItem = false;
      for (let i = 0; i < modelSize; i++) {
        if (model[i].name === item.value) {
          hasItem = true;
          break;
        }
      }
      if (!hasItem) {
        return false;
      }
    }
    return true;
  }
  // Generates a message and displays highlighted content of the message.
  async _previewOpenedChanged(opened) {
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
    const preview = await this._generatePreview();
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
    this.messagePreview = e.detail.code || preview;
  }

  /**
   * Called when the model chage. Regenerates the FormData object.
   *
   * @param {Array} model
   */
  _modelChanged(model) {
    if (this._cancelModelChange) {
      return;
    }
    const formData = this.createFormData(model);
    this.value = formData;
  }
  /**
   * Generates FormData from the model.
   * For the browsers with full FormData support it will generate Form data object from form
   * element. It means that it will have only basic support.
   * For browsers with full FormData support it will contain all properties (including
   * mime types).
   *
   * @param {Array} model View data model.
   * @return {FormData}
   */
  createFormData(model) {
    if (hasFormDataSupport) {
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
          const blob = new Blob([item.value], { type: item.contentType });
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
    for (let i = 0, len = model.length; i < len; i++) {
      if (model[i].value) {
        hasValue = true;
      }
    }
    return hasValue ? new FormData(this._getForm()) : undefined;
  }
  /**
   * Coppies current response text value to clipboard.
   * @param {Event} e
   */
  _copyToClipboard(e) {
    const button = e.target;
    const copy = this.shadowRoot.querySelector('clipboard-copy');
    if (copy.copy()) {
      button.innerText = 'Done';
    } else {
      button.innerText = 'Error';
    }
    button.disabled = true;
    if ('part' in button) {
      button.part.add('content-action-button-disabled');
      button.part.add('code-content-action-button-disabled');
    }
    setTimeout(() => this._resetCopyButtonState(button), 1000);
    const ev = new CustomEvent('send-analytics', {
      detail: {
        type: 'event',
        category: 'Usage',
        action: 'Click',
        label: 'Multipart payload editor clipboard copy',
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(ev);
  }

  _resetCopyButtonState(button) {
    button.innerText = 'Copy';
    button.disabled = false;
    if ('part' in button) {
      button.part.remove('content-action-button-disabled');
      button.part.remove('code-content-action-button-disabled');
    }
  }

  _previewHandler(e) {
    this.previewOpened = e.detail.value;
  }

  _nameChangeHandler(e) {
    this._propertyHandler('name', e);
  }

  _valueChangeHandler(e) {
    this._propertyHandler('value', e);
  }

  _typeChangeHandler(e) {
    this._propertyHandler('type', e);
  }

  _propertyHandler(prop, e) {
    const index = Number(e.target.dataset.index);
    /* istanbul ignore if  */
    if (index !== index) {
      return;
    }
    const { value } = e.detail;
    this.model[index][prop] = value;
    // this.model = [...this.model];
    // this._modelChanged(this.model);
  }
}
window.customElements.define('multipart-payload-editor', MultipartPayloadEditor);
