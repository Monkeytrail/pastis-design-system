import { LitElement, html, css } from 'lit';

export class PastisCodeBlock extends LitElement {
  static properties = {
    code:      { type: String },
    language:  { type: String },
    filename:  { type: String },
    copyable:  { type: Boolean, reflect: true },
    lineNumbers: { type: Boolean, reflect: true },
    _copied:   { type: Boolean, state: true },
  };

  static styles = css`
    :host { display: block; }

    .code-block {
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      overflow: hidden;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
      background: var(--bg-elevated, #383c44);
      gap: 12px;
    }

    .code-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filename {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .lang-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-primary, #f9f4da);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-full, 9999px);
      padding: 1px 6px;
    }

    .copy-btn {
      background: none;
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-sm, 4px);
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      cursor: pointer;
      transition: background 120ms ease;
    }

    .copy-btn:hover { background: var(--action-primary, #fcba28); color: var(--action-primary-text, #000); }
    .copy-btn.copied { border-color: var(--status-success, #fcba28); color: var(--status-success, #fcba28); }

    .code-scroll { overflow-x: auto; }

    pre {
      margin: 0;
      padding: 16px;
      color: var(--text-code, #fc7428);
      font-size: 13px;
      line-height: 1.6;
      display: flex;
      gap: 0;
    }

    .line-numbers {
      display: flex;
      flex-direction: column;
      min-width: 36px;
      text-align: right;
      padding-right: 16px;
      border-right: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      margin-right: 16px;
      user-select: none;
      color: var(--text-tertiary, #909498);
      font-size: 12px;
      line-height: 1.6;
    }

    code { white-space: pre; flex: 1; }
  `;

  constructor() {
    super();
    this.code = '';
    this.language = 'text';
    this.copyable = true;
    this.lineNumbers = false;
    this._copied = false;
  }

  async _copy() {
    try {
      await navigator.clipboard.writeText(this.code);
      this._copied = true;
      setTimeout(() => { this._copied = false; }, 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  }

  render() {
    const lines = (this.code || '').split('\n');
    const hasHeader = this.filename || this.language !== 'text' || this.copyable;

    return html`
      <div class="code-block" part="code-block">
        ${hasHeader ? html`
          <div class="code-header">
            <div class="code-meta">
              ${this.filename ? html`<span class="filename">${this.filename}</span>` : ''}
              ${this.language && this.language !== 'text' ? html`<span class="lang-badge">${this.language}</span>` : ''}
            </div>
            ${this.copyable ? html`
              <button
                class="copy-btn ${this._copied ? 'copied' : ''}"
                @click=${this._copy}
                aria-label="${this._copied ? 'Copied to clipboard' : 'Copy code'}"
              >
                ${this._copied ? '✓ Copied' : '⎘ Copy'}
              </button>
              <span aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">
                ${this._copied ? 'Copied to clipboard' : ''}
              </span>
            ` : ''}
          </div>
        ` : ''}
        <div class="code-scroll">
          <pre part="pre"><slot>
            ${this.lineNumbers ? html`
              <span class="line-numbers">
                ${lines.map((_, i) => html`${i + 1}\n`)}
              </span>
            ` : ''}
            <code>${this.code}</code>
          </slot></pre>
        </div>
      </div>
    `;
  }
}

customElements.define('pastis-code-block', PastisCodeBlock);
