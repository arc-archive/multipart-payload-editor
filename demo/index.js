import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '../multipart-payload-editor.js';

class ApiDemo extends ApiDemoPage {
  constructor() {
    super();

    this.initObservableProperties([
      'readOnly', 'disabled', 'outlined', 'compatibility',
      'allowCustom', 'noDocs', 'payloads', 'mediaTypes',
      'dataViewModel', 'mediaDropdownDisabled', 'mediaListSelected',
      'payloadResult', 'allowHideOptional'
    ]);

    this.componentName = 'form-data-editor';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.mediaDropdownDisabled = true;
    this.readOnly = false;
    this.disabled = false;
    this.allowHideOptional = false;

    this._modelHandler = this._modelHandler.bind(this);
    this._mainValueChanged = this._mainValueChanged.bind(this);
  }

  _mainDemoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.setData(selected);
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  setData(id) {
    const webApi = this._computeWebApi(this.amf);
    const operation = this._computeMethodModel(webApi, id);
    const expects = this._computeExpects(operation);
    const payload = this._computePayload(expects)[0];
    const skey = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    const schema = this._resolve(payload[skey][0]);
    const key = this._getAmfKey(this.ns.w3.shacl.property);
    const props = this._ensureArray(schema[key]);
    const node = /** @type any */ (document.getElementById('transformer'));
    const model = node.computeViewModel(props);
    this.dataViewModel = model;
  }

  _mainValueChanged(e) {
    const { value } = e.detail;
    const log = [];
    value.forEach((value, name) => {
      let item = `${name}: `;
      if (value.name) {
        item += value.name;
      } else {
        item += value;
      }
      log[log.length] = item;
    });
    this.payloadResult = log.join('\n');
  }

  _modelHandler(e) {
    this.dataViewModel = e.detail.value;
  }

  _demoTemplate() {
    const {
      readOnly,
      disabled,
      demoStates,
      darkThemeActive,
      outlined,
      compatibility,
      dataViewModel,
      payloadResult,
      allowHideOptional,
      narrow
    } = this;
    return html`<section class="documentation-section">
      <h3>API model demo</h3>
      <p>
        This demo lets you preview the Multipart body editor element with various
        configuration options.
      </p>
      <arc-interactive-demo
        .states="${demoStates}"
        @state-chanegd="${this._mainDemoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <multipart-payload-editor
          slot="content"
          ?readonly="${readOnly}"
          ?disabled="${disabled}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
          ?allowHideOptional="${allowHideOptional}"
          ?narrow="${narrow}"
          .model="${dataViewModel}"
          @value-changed="${this._mainValueChanged}"
          @model-changed="${this._modelHandler}"></multipart-payload-editor>
        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="readOnly"
          @change="${this._toggleMainOption}"
          >Read only</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="disabled"
          @change="${this._toggleMainOption}"
          >Disabled</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="narrow"
          @change="${this._toggleMainOption}"
          >Narrow view</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowHideOptional"
          @change="${this._toggleMainOption}"
          >Allow hide optional</anypoint-checkbox
        >
      </arc-interactive-demo>
      <section>
        <h3>Generated data</h3>
        <output>${payloadResult ? payloadResult : 'Value not ready'}</output>
      </section>
    </section>`;
  }

  contentTemplate() {
    const { amf } = this;
    return html`
    <api-view-model-transformer id="transformer" .amf="${amf}"></api-view-model-transformer>
    <h2 class="centered main">Multipart form editor</h2>
    ${this._demoTemplate()}`;
  }
}
const instance = new ApiDemo();
instance.render();
