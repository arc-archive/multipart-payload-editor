import {
  fixture,
  assert,
  nextFrame,
  aTimeout,
  html
} from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../multipart-payload-editor.js';
import {
  hasFormDataSupport
} from '../src/MultipartPayloadEditor.js';

const hasPartsApi = 'part' in document.createElement('span');

describe('<multipart-payload-editor>', function() {
  async function basicFixture() {
    return await fixture(html `
      <multipart-payload-editor></multipart-payload-editor>
    `);
  }

  async function allowHideOptionalFixture(model) {
    return await fixture(html `
      <multipart-payload-editor
        allowhideoptional
        .model="${model}"></multipart-payload-editor>
    `);
  }

  async function previewOpenedFixture() {
    const element = await fixture(html `
      <multipart-payload-editor></multipart-payload-editor>
    `);
    const fd = element.createFormData([
      { name: 'test', value: 'test', schema: { isFile: false } }
    ]);
    element.value = fd;
    element.previewOpened = true;
    element.messagePreview = 'test';
    await nextFrame();
    return element;
  }

  async function modelFixture() {
    const model = [{
      binding: 'type',
      hasDescription: false,
      name: 'i1',
      required: true,
      schema: {
        enabled: true,
        inputLabel: 'Property value 1',
        isCustom: true,
        isFile: true
      }
    }, {
      binding: 'type',
      hasDescription: false,
      name: 'i2',
      value: 'v2',
      contentType: '',
      required: true,
      schema: {
        enabled: true,
        inputLabel: 'Property value 2',
        isCustom: true,
        isFile: false,
        inputType: 'text'
      }
    }, {
      binding: 'type',
      hasDescription: false,
      name: 'i3',
      value: '{"test":true}',
      contentType: 'application/json',
      required: true,
      schema: {
        enabled: true,
        inputLabel: 'Property value 3',
        isCustom: true,
        isFile: false,
        inputType: 'text'
      }
    }];
    return await fixture(html `
      <multipart-payload-editor .model="${model}"></multipart-payload-editor>
    `);
  }

  describe('Initialization', () => {
    it('can be created with document.createElement', () => {
      const element = document.createElement('multipart-payload-editor');
      assert.ok(element);
    });

    it('adds file field when no model', async () => {
      const element = await basicFixture();
      assert.typeOf(element.model, 'array', 'has the model');
      assert.lengthOf(element.model, 1, 'model has single item');
      assert.isTrue(element.model[0].schema.isFile, 'is a file');
    });

    it('does not add default input when has model', async () => {
      const element = await modelFixture();
      assert.lengthOf(element.model, 3, 'model has 3 items');
    });

    it('does not set value when no name and value', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.value);
    });

    it('does not set messagePreview', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.messagePreview);
    });

    it('does not set previewOpened', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.previewOpened);
    });

    it('does not set generatingPreview', async () => {
      const element = await basicFixture();
      assert.isUndefined(element.generatingPreview);
    });

    it('renders the form', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('iron-form');
      assert.ok(node);
    });

    it('renders the form item', async () => {
      const element = await basicFixture();
      const nodes = element.shadowRoot.querySelectorAll('.form-item');
      assert.lengthOf(nodes, 1);
    });

    it('renders add buttons', async () => {
      const element = await basicFixture();
      const nodes = element.shadowRoot.querySelectorAll('[data-action="add-file"],[data-action="add-text"]');
      assert.lengthOf(nodes, 2);
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('Content actions', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders preview button', () => {
      const node = element.shadowRoot.querySelector('anypoint-button[data-action="preview"]');
      assert.ok(node);
    });

    it('copy is not rendered when not in preview', () => {
      const node = element.shadowRoot.querySelector('anypoint-button[data-action="copy"]');
      assert.notOk(node);
    });

    it('copy is rendered when in preview', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      element.previewOpened = true;
      element.messagePreview = 'test';
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-button[data-action="copy"]');
      assert.ok(node);
    });
  });

  describe('addFile()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.addFile();
    });

    it('model is an array', () => {
      assert.typeOf(element.model, 'array');
    });

    it('model has two item', () => {
      assert.lengthOf(element.model, 2);
    });

    it('added item is a file', () => {
      assert.isTrue(element.model[1].schema.isFile);
    });

    it('added item has empty name', () => {
      assert.equal(element.model[1].name, '');
    });

    it('added item value is undefined', () => {
      assert.notOk(element.model[1].value);
    });

    it('adds an item when add file part button is clicked', async () => {
      const node = element.shadowRoot.querySelector('.action-button[data-action="add-file"]');
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.model, 3);
    });
  });

  describe('addText()', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
      element.addText();
    });

    it('model is an array', () => {
      assert.typeOf(element.model, 'array');
    });

    it('model has one item', () => {
      assert.lengthOf(element.model, 2);
    });

    it('added item is not a file', () => {
      assert.isFalse(element.model[1].schema.isFile);
    });

    it('added item has empty name', () => {
      assert.equal(element.model[1].name, '');
    });

    it('added item has empty value', () => {
      assert.equal(element.model[1].value, '');
    });

    (hasFormDataSupport ? it : it.skip)('added item has empty contentType', () => {
      assert.equal(element.model[1].contentType, '');
    });

    it('adds an item when add file part button is clicked', async () => {
      const node = element.shadowRoot.querySelector('.action-button[data-action="add-text"]');
      MockInteractions.tap(node);
      await nextFrame();
      assert.lengthOf(element.model, 3);
    });
  });

  describe('createFormData()', () => {
    let element;

    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Do not generate FormData with empty model', () => {
      assert.isUndefined(element.createFormData([]));
    });

    it('Do not generate FormData data for model with empty values', () => {
      assert.isUndefined(element.createFormData([{
        name: '',
        schema: {
          isFile: true
        }
      }]));
    });

    it('Generates form data for text value', () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      assert.typeOf(fd, 'formdata');
    });

    it('Generates form data for text value with content type', () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false,
        },
        contentType: 'application/json'
      }]);
      assert.typeOf(fd, 'formdata');
    });

    it('Generates form data for file value', () => {
      const fd = element.createFormData([{
        name: 'test',
        value: new Blob(['test'], {
          type: 'application/json'
        }),
        schema: {
          isFile: true
        }
      }]);
      assert.typeOf(fd, 'formdata');
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('_generatePreview()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Generates preview data for file', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        contentType: 'application/json',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      await aTimeout(10);
      const content = await element._generatePreview();
      assert.typeOf(content, 'string');
    });

    it('Generates preview data for text', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      const content = await element._generatePreview();
      assert.typeOf(content, 'string');
    });

    it('generatingPreview is true when working', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      const result = element._generatePreview();
      assert.isTrue(element.generatingPreview);
      await result;
    });

    it('generatingPreview is false after finish', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      await element._generatePreview();
      assert.isFalse(element.generatingPreview);
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('_previewOpenedChanged()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('messagePreview and _messagePreviewCode are cleared', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      element.messagePreview = 'test';
      element._messagePreviewCode = 'test';
      const p = element._previewOpenedChanged(true);
      assert.isUndefined(element.messagePreview);
      assert.isUndefined(element._messagePreviewCode);
      await p;
    });

    it('messagePreview and _messagePreviewCode are set after finish', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      await element._previewOpenedChanged(true);
      assert.typeOf(element.messagePreview, 'string', 'messagePreview is set');
      assert.typeOf(element._messagePreviewCode, 'string', '_messagePreviewCode is set');
    });

    it('renders info toast when no value', async () => {
      const spy = sinon.spy(element, '_toastMessage');
      await element._previewOpenedChanged(true);
      assert.equal(spy.args[0][0], 'Add a valid form items before generating a preview');
      const toast = element.shadowRoot.querySelector('paper-toast');
      assert.isTrue(toast.opened);
    });

    it('dispatches syntax-highlight event', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      const spy = sinon.spy();
      element.addEventListener('syntax-highlight', spy);
      await element._previewOpenedChanged(true);
      assert.isTrue(spy.called);
    });

    it('renders the preview when preview button click', async () => {
      const fd = element.createFormData([{
        name: 'test',
        value: 'test',
        schema: {
          isFile: false
        }
      }]);
      element.value = fd;
      const button = element.shadowRoot.querySelector('anypoint-button[data-action="preview"]');
      MockInteractions.tap(button);
      assert.isTrue(element.previewOpened);
      await aTimeout(100);
      const code = element.shadowRoot.querySelector('code');
      assert.ok(code);
    });
  });

  describe('_toastMessage', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('opens the toast', () => {
      element._toastMessage('test');
      const toast = element.shadowRoot.querySelector('paper-toast');
      assert.isTrue(toast.opened);
    });

    it('sets text message', () => {
      element._toastMessage('test');
      const toast = element.shadowRoot.querySelector('paper-toast');
      assert.equal(toast.text, 'test');
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('Restore form data', () => {
    let fd;
    let element;
    beforeEach(async () => {
      function noop() {}
      fd = new FormData();
      fd.append('text', 'test');
      try {
        fd.append('file', new Blob(['test'], {
          type: 'plain/text'
        }));
        fd.append('text-w-ct', new Blob(['test'], {
          type: 'plain/text'
        }));
      } catch (e) {
        noop();
      }
      element = await basicFixture();
    });

    it('Creates model from FormData', async () => {
      await element._restoreFormData(fd);
      assert.typeOf(element.model, 'array');
      assert.lengthOf(element.model, 3);
    });

    it('Restores text data', async () => {
      await element._restoreFormData(fd);
      const model = element.model[0];
      assert.isFalse(model.schema.isFile);
      assert.equal(model.name, 'text');
      assert.equal(model.value, 'test');
    });

    it('Restores file data', async () => {
      await element._restoreFormData(fd);
      const model = element.model[1];
      assert.isTrue(model.schema.isFile);
      assert.equal(model.name, 'file');
      assert.isTrue(model.value instanceof Blob);
    });

    it('Restores text from ARC meta', async () => {
      fd._arcMeta = {
        textParts: ['text-w-ct']
      };
      await element._restoreFormData(fd);
      const model = element.model[2];
      assert.isFalse(model.schema.isFile);
      assert.equal(model.name, 'text-w-ct');
      assert.equal(model.value, 'test');
      assert.equal(model.contentType, 'plain/text');
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('_copyToClipboard()', () => {
    let element;
    beforeEach(async () => {
      element = await previewOpenedFixture();
    });

    it('Calls copy() in the `clipboard-copy` element', async () => {
      const copy = element.shadowRoot.querySelector('clipboard-copy');
      const spy = sinon.spy(copy, 'copy');
      const button = element.shadowRoot.querySelector('anypoint-button[data-action="copy"]');
      button.click();
      assert.isTrue(spy.called);
    });

    it('Changes the label', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.notEqual(button.innerText.trim()
        .toLowerCase(), 'copy');
    });

    it('Disables the button', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.click();
        assert.isTrue(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)('Adds content-action-button-disabled to the button', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.isTrue(button.part.contains('content-action-button-disabled'));
    });

    (hasPartsApi ? it : it.skip)('Adds code-content-action-button-disabled to the button', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.isTrue(button.part.contains('code-content-action-button-disabled'));
    });
  });

  (hasFormDataSupport ? describe : describe.skip)('_resetCopyButtonState()', () => {
    let element;
    beforeEach(async () => {
      element = await previewOpenedFixture();
    });

    it('Changes label back', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.innerText = 'test';
        element._resetCopyButtonState(button);
        assert.equal(button.innerText.trim()
          .toLowerCase(), 'copy');
        done();
      });
    });

    it('Restores disabled state', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.click();
        button.disabled = true;
        element._resetCopyButtonState(button);
        assert.isFalse(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)('Removes content-action-button-disabled part from the button', async () => {
      await aTimeout();
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      element._resetCopyButtonState(button);
      assert.isFalse(button.part.contains('content-action-button-disabled'));
    });

    (hasPartsApi ? it : it.skip)('Removes code-content-action-button-disabled part from the button', async () => {
      await aTimeout();
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      element._resetCopyButtonState(button);
      assert.isFalse(button.part.contains('code-content-action-button-disabled'));
    });
  });

  describe('_nameChangeHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('changes model name when file name changes', () => {
      const item = element.shadowRoot.querySelector('multipart-file-form-item');
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: 'test'
        }
      }));
      assert.equal(element.model[0].name, 'test');
    });

    it('changes the model array', () => {
      const old = element.model;
      const item = element.shadowRoot.querySelector('multipart-file-form-item');
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: 'test'
        }
      }));
      assert.isFalse(element.model === old);
    });

    it('changes model name when text name changes', () => {
      const item = element.shadowRoot.querySelector('multipart-text-form-item');
      item.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: 'test'
        }
      }));
      assert.equal(element.model[1].name, 'test');
    });
  });

  describe('_valueChangeHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('changes model value when file name changes', () => {
      const value = new Blob(['test'], {
        type: 'application/json'
      });
      const item = element.shadowRoot.querySelector('multipart-file-form-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value
        }
      }));
      assert.equal(element.model[0].value, value);
    });

    it('changes the model array', () => {
      const old = element.model;
      const value = new Blob(['test'], {
        type: 'application/json'
      });
      const item = element.shadowRoot.querySelector('multipart-file-form-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value
        }
      }));
      assert.isFalse(element.model === old);
    });

    it('changes model value when text name changes', () => {
      const item = element.shadowRoot.querySelector('multipart-text-form-item');
      item.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: 'test'
        }
      }));
      assert.equal(element.model[1].value, 'test');
    });
  });

  describe('_typeChangeHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('changes model contentType when text name changes', () => {
      const item = element.shadowRoot.querySelector('multipart-text-form-item');
      item.dispatchEvent(new CustomEvent('type-changed', {
        detail: {
          value: 'test'
        }
      }));
      assert.equal(element.model[1].contentType, 'test');
    });

    it('changes the model array', () => {
      const old = element.model;
      const value = 'application/json';
      const item = element.shadowRoot.querySelector('multipart-text-form-item');
      item.dispatchEvent(new CustomEvent('type-changed', {
        detail: {
          value
        }
      }));
      assert.isFalse(element.model === old);
    });
  });

  describe('_getLegacyFormData()', () => {
    it('returns form data instance', async () => {
      const element = await modelFixture();
      const result = element._getLegacyFormData(element.model);
      assert.typeOf(result, 'formdata');
    });

    it('returns undefined when no model values', async () => {
      const element = await basicFixture();
      const result = element._getLegacyFormData(element.model);
      assert.isUndefined(result);
    });

    it('returns undefined when no model', async () => {
      const element = await basicFixture();
      const result = element._getLegacyFormData();
      assert.isUndefined(result);
    });
  });

  describe('Allow hide optional', () => {
    let model;
    let element;
    beforeEach(async () => {
      model = [{
        binding: 'type',
        hasDescription: false,
        name: 'i1',
        required: true,
        schema: {
          enabled: true,
          inputLabel: 'Property value 1',
          isCustom: true,
          isFile: true
        }
      }, {
        binding: 'type',
        hasDescription: false,
        name: 'i2',
        value: 'v2',
        contentType: '',
        required: false,
        schema: {
          enabled: true,
          inputLabel: 'Property value 2',
          isCustom: true,
          isFile: false,
          inputType: 'text'
        }
      }];
      element = await allowHideOptionalFixture(model);
    });

    it('renders show optional checkbox', () => {
      const node = element.shadowRoot.querySelector('.toggle-checkbox');
      assert.ok(node);
    });

    it('first item is visible', () => {
      const node = element.shadowRoot.querySelector('.form-item');
      const result = getComputedStyle(node).display.trim();
      assert.notEqual(result, 'none');
    });

    it('second item is not visible', () => {
      const node = element.shadowRoot.querySelector('.form-item:nth-child(2)');
      const result = getComputedStyle(node).display.trim();
      assert.equal(result, 'none');
    });

    it('second item is visible when button toggled', async () => {
      MockInteractions.tap(element.shadowRoot.querySelector('.toggle-checkbox'));
      await nextFrame();
      const node = element.shadowRoot.querySelector('.form-item:nth-child(2)');
      const result = getComputedStyle(node).display.trim();
      assert.notEqual(result, 'none');
    });
  });

  describe('_createModelObject()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns an object whe no default values', () => {
      const result = element._createModelObject();
      assert.typeOf(result, 'object');
    });

    it('returns an object with file definition', () => {
      const init = {
        type: 'file'
      };
      const result = element._createModelObject(init);
      assert.equal(result.type, 'file');
    });
  });

  describe('onmodel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onmodel);
      const f = () => {};
      element.onmodel = f;
      assert.isTrue(element.onmodel === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onmodel = f;
      element.model = [];
      element.onmodel = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onmodel = f1;
      element.onmodel = f2;
      element.model = [];
      element.onmodel = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onchange', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onchange);
      const f = () => {};
      element.onchange = f;
      assert.isTrue(element.onchange === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onchange = f;
      element.value = 'a=b';
      element.onchange = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onchange = f1;
      element.onchange = f2;
      element.value = 'a=b';
      element.onchange = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });

  describe('a11y', () => {
    it('is accessible in default state', async () => {
      const element = await basicFixture();
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible with values', async () => {
      const element = await modelFixture();
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible in preview', async () => {
      const element = await previewOpenedFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});
