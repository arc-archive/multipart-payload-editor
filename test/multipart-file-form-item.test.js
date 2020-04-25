import {
  fixture,
  assert,
  nextFrame,
  html
} from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../multipart-file-form-item.js';


describe('<multipart-file-form-item>', function() {
  async function basicFixture() {
    const model = {
      binding: 'type',
      hasDescription: true,
      description: 'test',
      name: 'i2',
      value: '',
      schema: {
        enabled: true,
        inputLabel: 'Property value',
        isCustom: true,
        isFile: true,
        inputType: 'file'
      }
    };
    return await fixture(html `
      <multipart-file-form-item .model="${model}" name="i2"></multipart-file-form-item>
    `);
  }

  async function noModelFixture() {
    return await fixture(html `
      <multipart-file-form-item></multipart-file-form-item>
    `);
  }

  describe('Initialization', () => {
    it('can be created with document.createElement', () => {
      const element = document.createElement('multipart-file-form-item');
      assert.ok(element);
    });

    it('renders hint-icon', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.hint-icon');
      assert.ok(node);
    });

    it('can be initialized without the model', async () => {
      const element = await noModelFixture();
      assert.ok(element);
    });

    it('render file trigger button', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.file-trigger');
      assert.ok(node);
    });

    it('file input is hidden', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('input[type="file"]');
      const result = getComputedStyle(node).display.trim();
      assert.equal(result, 'none');
    });
  });

  describe('docs rendering', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('docs are not rendered by default', async () => {
      const node = element.shadowRoot.querySelector('.docs');
      assert.notOk(node);
    });

    it('docs are rendered after hint button click', async () => {
      const button = element.shadowRoot.querySelector('.hint-icon');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('.docs');
      assert.ok(node);
    });
  });

  describe('name change', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('updates name property', async () => {
      const input = element.shadowRoot.querySelector('.name-field').inputElement;
      input.value = 'test-changed';
      input.dispatchEvent(new CustomEvent('input'));
      await nextFrame();
      assert.equal(element.name, 'test-changed');
    });

    it('disaptches name-changed', async () => {
      const spy = sinon.spy();
      element.addEventListener('name-changed', spy);
      const input = element.shadowRoot.querySelector('.name-field').inputElement;
      input.value = 'test-changed';
      input.dispatchEvent(new CustomEvent('input'));
      await nextFrame();
      assert.equal(spy.args[0][0].detail.value, 'test-changed');
    });
  });

  describe('value change', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('updates name property', async () => {
      const value = new Blob(['test'], {
        type: 'application/json'
      });
      element._fileObjectChanged({
        target: {
          files: [value]
        }
      });
      assert.equal(element.value, value);
    });

    it('disaptches name-changed', async () => {
      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);
      const value = new Blob(['test'], {
        type: 'application/json'
      });
      element._fileObjectChanged({
        target: {
          files: [value]
        }
      });
      assert.equal(spy.args[0][0].detail.value, value);
    });
  });

  describe('_computeAccept()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns undefined when no model', () => {
      const result = element._computeAccept();
      assert.isUndefined(result);
    });

    it('returns undefined when types declared in the model', () => {
      const result = element._computeAccept(element.model);
      assert.isUndefined(result);
    });

    it('returns string for fileTypes', () => {
      const result = element._computeAccept({
        fileTypes: ['application/png', 'application/jpeg']
      });
      assert.equal(result, 'application/png,application/jpeg');
    });

    it('returns string for fixedFacets', () => {
      const result = element._computeAccept({
        fixedFacets: {
          fileTypes: ['application/png', 'application/jpeg']
        }
      });
      assert.equal(result, 'application/png,application/jpeg');
    });
  });

  describe('validation', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('validates the input', () => {
      const value = new Blob(['test'], {
        type: 'application/json'
      });
      element.value = value;
      const result = element.validate();
      assert.isTrue(result);
    });

    it('is not valied when no value', () => {
      element.value = '';
      const result = element.validate();
      assert.isFalse(result);
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
    it('is accessible with data', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });
});
