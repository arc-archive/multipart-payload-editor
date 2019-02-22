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
import '../../@polymer/polymer/polymer-legacy.js';

import '../../@polymer/polymer/lib/elements/dom-if.js';
import { afterNextRender } from '../../@polymer/polymer/lib/utils/render-status.js';
import { IronValidatableBehavior } from '../../@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../paper-autocomplete/paper-autocomplete.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../arc-icons/arc-icons.js';
import '../../api-property-form-item/api-property-form-item.js';
import '../../@polymer/marked-element/marked-element.js';
import '../../markdown-styles/markdown-styles.js';
import '../../@polymer/iron-collapse/iron-collapse.js';
import '../../api-form-mixin/api-form-styles.js';
import { html } from '../../@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '../../@polymer/polymer/lib/legacy/class.js';
import { PolymerElement } from '../../@polymer/polymer/polymer-element.js';
/**
 * A text form item.
 *
 * If the browser has native support for FormData (and iterators) then it will also render
 * a content type selector for the input field.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @appliesMixin Polymer.IronValidatableBehavior
 */
class MultipartTextFormItem extends mixinBehaviors([IronValidatableBehavior], PolymerElement) {
  static get template() {
    return html`
    <style include="markdown-styles"></style>
    <style include="api-form-styles"></style>
    <style>
    :host {
      display: block;
      @apply --layout-flex;
    }

    .multipart-item {
      @apply --layout-vertical;
      @apply --layout-flex;
    }

    .mime-selector {
      position: relative;
    }

    .value-selector {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    api-property-form-item {
      @apply --layout-flex;
      margin-left: 12px;
    }

    .mime-selector paper-input {
      max-width: 360px;
    }

    .name-field {
      max-width: 360px;
      @apply --layout-flex;
    }

    paper-autocomplete {
      top: 34px;
    }
    </style>
    <div class="multipart-item">
      <template is="dom-if" if="[[hasFormData]]">
        <div class="mime-selector">
          <paper-input label="Content type (Optional)" value="{{type}}" no-label-float=""></paper-input>
          <paper-autocomplete target="[[_mimeInput]]" source="[[suggestions]]" open-on-focus=""></paper-autocomplete>
        </div>
      </template>
      <div class="value-selector">
        <paper-input class="name-field" label="Field name" error-message="The name is required" required="" auto-validate="" value="{{name}}" no-label-float=""></paper-input>
        <api-property-form-item model="[[model]]" name="[[name]]" value="{{value}}" no-label-float=""></api-property-form-item>
        <template is="dom-if" if="[[model.hasDescription]]">
          <paper-icon-button class="hint-icon" icon="arc:help" on-tap="toggleDocumentation" title="Display documentation"></paper-icon-button>
        </template>
      </div>
    </div>
    <template is="dom-if" if="[[model.hasDescription]]" restamp="">
      <div class="docs">
        <iron-collapse opened="[[docsOpened]]">
          <marked-element markdown="[[model.description]]">
            <div slot="markdown-html" class="markdown-body"></div>
          </marked-element>
        </iron-collapse>
      </div>
    </template>
`;
  }

  static get is() { return 'multipart-text-form-item'; }
  static get properties() {
    return {
      /**
       * Name of this control
       */
      name: {
        type: String,
        notify: true
      },
      /**
       * Valuie of this control.
       */
      value: {
        type: String,
        notify: true
      },
      /**
       * A view model.
       */
      model: Object,
      /**
       * True to render documentation (if set in model)
       */
      docsOpened: Boolean,
      /**
       * Reference to the mime type input
       */
      _mimeInput: {
        type: HTMLElement
      },
      // A content type of the form field to be presented in the Multipart request.
      type: {
        type: String,
        notify: true
      },
      // List of suggested mime types
      suggestions: {
        type: Array,
        value: function() {
          return [
            'multipart-form-data',
            'application/x-www-form-urlencoded',
            'application/json',
            'application/xml',
            'application/base64',
            'application/octet-stream',
            'text/plain',
            'text/css',
            'text/html',
            'application/javascript'
          ];
        }
      },
      // If set it will also renders mime type selector for the input data.
      hasFormData: {
        type: Boolean,
        observer: '_hasFormDataChanged'
      }
    };
  }
  /**
   * Toggles documentation (if available)
   */
  toggleDocumentation() {
    this.docsOpened = !this.docsOpened;
  }

  ready() {
    super.ready();
    if (this.hasFormData) {
      this._setAutocompleteTarget();
    }
  }

  _getValidity() {
    return !!(this.name && this.value);
  }

  _hasFormDataChanged(hasFormData) {
    if (hasFormData) {
      this._setAutocompleteTarget();
    } else {
      this.set('_mimeInput', undefined);
    }
  }

  _setAutocompleteTarget() {
    afterNextRender(this, function() {
      this.set('_mimeInput', this.$$('.mime-selector paper-input'));
    });
  }
}
window.customElements.define(MultipartTextFormItem.is, MultipartTextFormItem);
