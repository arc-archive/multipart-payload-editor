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
import { html, LitElement } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import formStyles from '@api-components/api-form-mixin/api-form-styles.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import { help } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import styles from './MultipartFileFormItemStyles.js';
/**
 * A file form item.
 *
 * @customElement
 * @demo demo/index.html
 * @mixes ValidatableMixin
 * @extends LitElement
 */
export class MultipartFileFormItem extends ValidatableMixin(LitElement) {
  get styles() {
    return [
      markdownStyles,
      formStyles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * Computed value, true if the control has a file.
       */
      _hasFile: { type: Boolean },
      /**
       * Name of this control
       */
      name: { type: String },
      /**
       * Value of this control.
       */
      value: { },
      /**
       * A view model.
       */
      model: { type: Object },
      /**
       * True to render documentation (if set in model)
       */
      docsOpened: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * @deprecated Use `compatibility` instead
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
      disabled: { type: Boolean },
      /**
       * A content type of the form field to be presented in the Multipart request.
       */
      type: { type: String },
      /**
       * When set it will also renders mime type selector for the input data.
       */
      hasFormData: { type: Boolean },
    };
  }

  get legacy() {
    return this.compatibility;
  }

  set legacy(value) {
    this.compatibility = value;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const old = this._value;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._value = value;
    this._hasFile = this._computeHasFile(value);
    this.requestUpdate('value', old);
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._type;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._type = value;
    this.requestUpdate('type', old);
  }

  /**
   * @return {boolean} True if docs are rendered
   */
  get _docsRendered() {
    const { docsOpened, model={} } = this;
    return !!docsOpened && !!model.hasDescription;
  }

  constructor() {
    super();
    this.disabled = false;
    this.outlined = false;
    this.readOnly = false;
    this.docsOpened = false;
    this.model = null;
  }

  /**
   * Dispatches `value-changed` event.
   * @param {File} value
   */
  _notifyChange(value) {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: {
        value
      }
    }));
  }

  /**
   * Toggles documentation (if available)
   */
  toggleDocumentation() {
    this.docsOpened = !this.docsOpened;
  }

  _getValidity() {
    return !!(this.name && this.value instanceof Blob);
  }
  /**
   * Tests if current value is a type of `Blob`.
   *
   * @param {String|Blob|File|undefined} value Value to test
   * @return {Boolean}
   */
  _computeHasFile(value) {
    return !!(value && value instanceof Blob);
  }

  /**
   * A handler to choose file button click.
   * This function will find a proper input[type="file"] and programatically click on it to open
   * file dialog.
   */
  _selectFile() {
    const file = /** @type HTMLInputElement */ (this.shadowRoot.querySelector('input[type="file"]'));
    file.click();
  }

  _updateFileType(file) {
    const {type} = this

    if (type === undefined || type === file.type) {
      return file
    }

    // should update file if content type defined
    const newType = type || this._defaultType
    return new Blob([file], {type: newType})
  }

  /**
   * A handler to file change event for input[type="file"].
   * This will update files array for corresponding `this.filesList` array object.
   *
   * @param {Event} e
   */
  _fileObjectChanged(e) {
    const target = /** @type HTMLInputElement */ (e.target);
    const targetFile = target.files[0];
    const file = this._updateFileType(targetFile);
    this.value = file;
    this._defaultType = targetFile.type;
    this._notifyChange(file);
  }
  /**
   * Computes the `accept`attribute for file input.
   *
   * @return {String}
   */
  _computeAccept() {
    const model = this.model || {};
    if (!model) {
      return;
    }
    let types;
    if (model.fileTypes && model.fileTypes.length && typeof model.fileTypes[0] === 'string') {
      types = model.fileTypes;
    } else if (model.fixedFacets && model.fixedFacets.fileTypes && model.fixedFacets.fileTypes.length) {
      types = model.fixedFacets.fileTypes;
    }
    if (types) {
      return types.join(',');
    }
  }

  _nameHandler(e) {
    const { value } = e.detail;
    this.name = value;
    this.dispatchEvent(new CustomEvent('name-changed', {
      detail: {
        value
      }
    }));
  }

  _changeHandler(e) {
    const { value } = e.detail;
    if (this.type === value) {
      return;
    }
    this.type = value;
    this.dispatchEvent(new CustomEvent(`type-changed`, {
      detail: {
        value
      }
    }));

    if (this.value && this.value.type !== value) {
      const file = this._updateFileType(this.value);
      this.value = file
      this._notifyChange(file);
    }
  }

  _mimeSelectorTemplate() {
    const {
      hasFormData,
      type,
      readOnly,
      disabled,
      compatibility,
      outlined,
    } = this;
    if (!hasFormData) {
      return '';
    }
    return html`<div class="mime-selector">
      <anypoint-input
        class="type-field"
        .value="${type}"
        @value-changed="${this._changeHandler}"
        type="text"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        .readOnly="${readOnly}"
        .disabled=${disabled}
      >
        <label slot="label">Content type (Optional)</label>
      </anypoint-input>
    </div>`;
  }

  render() {
    return html`<style>${this.styles}</style>
    ${this._mimeSelectorTemplate()}
    <div class="inputs">
      ${this._nameTemplate()}
      ${this._triggerTemplate()}
      ${this._helpButtonTemplate()}
      <slot name="action-icon"></slot>
    </div>
    ${this._fileLabelTemplate()}
    ${this._docsTemplate()}
    <input type="file" hidden @change="${this._fileObjectChanged}" accept="${this._computeAccept()}">`;
  }

  _nameTemplate() {
    const {
      name,
      readOnly,
      disabled,
      compatibility,
      outlined
    } = this;
    const model = this.model || {};
    const {required} = model;
    const fieldName = `Field name${required ? '*' : ''}`
    return html`<anypoint-input
      class="name-field"
      invalidmessage="Value is required but currently empty."
      ?required="${required}"
      autovalidate
      .value="${name}"
      @value-changed="${this._nameHandler}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
      .readOnly="${readOnly}"
      .disabled=${disabled}
      >
        <label slot="label">${fieldName}</label>
    </anypoint-input>`;
  }

  _triggerTemplate() {
    const {
      readOnly,
      disabled,
      compatibility,
    } = this;
    return html`
    <anypoint-button
      emphasis="high"
      @click="${this._selectFile}"
      class="file-trigger"
      ?disabled="${disabled || readOnly}"
      ?compatibility="${compatibility}"
    >Choose file</anypoint-button>`;
  }

  _docsTemplate() {
    if (!this._docsRendered) {
      return '';
    }
    const { model = {} } = this;
    return html`<div class="docs">
      <arc-marked .markdown="${model.description}" sanitize>
        <div slot="markdown-html" class="markdown-body"></div>
      </arc-marked>
    </div>`;
  }

  _helpButtonTemplate() {
    const {
      disabled,
      compatibility,
      outlined,
    } = this;
    const model = this.model || {};
    if (!model.hasDescription) {
      return '';
    }
    return html`<anypoint-icon-button
      class="hint-icon"
      title="Toggle documentation"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}"
      ?disabled="${disabled}"
      @click="${this.toggleDocumentation}"
    >
      <span class="icon">${help}</span>
    </anypoint-icon-button>`;
  }

  _fileLabelTemplate() {
    const {
      value,
      _hasFile
    } = this;
    if (!_hasFile) {
      return '';
    }
    return html`
    <span class="files-counter-message">
      ${value.name} (${value.size} bytes)
    </span>`;
  }


}
