import { css } from 'lit-element';
export default css`
:host {
  display: block;
  flex: 1;
}

*[hidden] {
  display: none !important;
}

.inputs {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.file-trigger,
.param-name {
  margin-right: 12px;
}

.files-counter-message {
  color: var(--multipart-file-form-item-counter-color, rgba(0, 0, 0, 0.74));
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 8px;
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
}
`;
