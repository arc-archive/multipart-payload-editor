/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   multipart-file-form-item.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {html, css, LitElement} from 'lit-element';

import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';

/**
 * A file form item.
 */
declare class MultipartFileFormItem extends
  ValidatableMixin(
  Object) {

  /**
   * Valuie of this control.
   */
  value: string|null|undefined;

  /**
   * Computed value, true if the control has a file.
   */
  _hasFile: boolean|null|undefined;

  /**
   * Name of this control
   */
  name: string|null|undefined;

  /**
   * A view model.
   */
  model: object|null|undefined;

  /**
   * True to render documentation (if set in model)
   */
  docsOpened: boolean|null|undefined;

  /**
   * Enables Anypoint legacy styling
   */
  legacy: boolean|null|undefined;

  /**
   * Enables Material Design outlined style
   */
  outlined: boolean|null|undefined;

  /**
   * When set the editor is in read only mode.
   */
  readOnly: boolean|null|undefined;

  /**
   * When set all controls are disabled in the form
   */
  disabled: boolean|null|undefined;
  render(): any;

  /**
   * Toggles documentation (if available)
   */
  toggleDocumentation(): void;
  _getValidity(): any;

  /**
   * Tests if current value is a type of `Blob`.
   *
   * @param value Value to test
   */
  _computeHasFile(value: String|Blob|File|null|undefined): Boolean|null;

  /**
   * A handler to choose file button click.
   * This function will find a proper input[type="file"] and programatically click on it to open
   * file dialog.
   */
  _selectFile(): void;

  /**
   * A handler to file change event for input[type="file"].
   * This will update files array for corresponding `this.filesList` array object.
   */
  _fileObjectChanged(e: Event|null): void;

  /**
   * Computes the `accept`attribute for file input.
   */
  _computeAccept(model: object|null): String|null;
  _nameHandler(e: any): void;
}

declare global {

  interface HTMLElementTagNameMap {
    "multipart-file-form-item": MultipartFileFormItem;
  }
}
