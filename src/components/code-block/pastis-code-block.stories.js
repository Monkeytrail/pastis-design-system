import './pastis-code-block.js';

export default {
  title: 'Data Display/CodeBlock',
  component: 'pastis-code-block',
  tags: ['autodocs'],
};

const jsCode = `import { LitElement, html, css } from 'lit';

export class PastisButton extends LitElement {
  static properties = {
    variant: { type: String },
  };

  render() {
    return html\`<button class=\${this.variant}><slot></slot></button>\`;
  }
}

customElements.define('pastis-button', PastisButton);`;

const cssCode = `:root {
  --color-primary: #00FF41;
  --color-bg: #000000;
  --font-mono: 'Courier New', monospace;
}

.button {
  border: 4px solid var(--color-primary);
  background: var(--color-bg);
  color: var(--color-primary);
  padding: 0 16px;
  height: 48px;
}`;

export const Default = {
  render: () => {
    const el = document.createElement('pastis-code-block');
    el.code = jsCode;
    el.language = 'javascript';
    el.filename = 'pastis-button.js';
    return el;
  },
};

export const WithLineNumbers = {
  render: () => {
    const el = document.createElement('pastis-code-block');
    el.code = jsCode;
    el.language = 'javascript';
    el.filename = 'pastis-button.js';
    el.lineNumbers = true;
    return el;
  },
};

export const CSS = {
  render: () => {
    const el = document.createElement('pastis-code-block');
    el.code = cssCode;
    el.language = 'css';
    el.filename = 'tokens.css';
    return el;
  },
};

export const NoCopy = {
  render: () => {
    const el = document.createElement('pastis-code-block');
    el.code = 'npm install @pastis/design-system';
    el.language = 'bash';
    el.copyable = false;
    return el;
  },
};

export const Minimal = {
  render: () => {
    const el = document.createElement('pastis-code-block');
    el.code = 'const greeting = "Hello, 8-bit world!";';
    el.language = 'text';
    el.copyable = false;
    return el;
  },
};
