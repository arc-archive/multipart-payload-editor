import { css } from 'lit-element';

export default css`:host {
  display: block;
  flex: 1;
}

.multipart-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.mime-selector {
  position: relative;
}

.value-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.inputs {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

:host([narrow]) .inputs {
  flex-direction: column;
  align-items: start;
  margin-right: 8px;
}

api-property-form-item {
  flex: 1;
  margin-left: 12px;
}

:host([narrow]) .inputs anypoint-input,
:host([narrow]) .inputs api-property-form-item {
  max-width: initial;
  flex: auto;
}

:host([narrow]) .inputs anypoint-input {
  width: calc(100% - 16px);
}

:host([narrow]) api-property-form-item {
  margin-left: 0px;
  width: 100%;
}

.mime-selector anypoint-input {
  max-width: 360px;
}

.name-field {
  max-width: 360px;
  flex: 1;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}`;
