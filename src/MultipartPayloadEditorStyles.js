import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

[hidden] {
  display: none !important;
}

.form-item {
  display: flex;
  flex-direction: row;
}

.delete-action {
  display: block;
}

multipart-text-form-item,
multipart-file-form-item {
  margin: 8px 0;
  width: 100%;
}

code {
  font-family: var(--arc-font-code-family);
  white-space: pre-line;
  word-break: break-all;
  overflow: auto;
  margin: 20px;
  box-sizing: border-box;
  display: block;
}

.editor-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}`;
