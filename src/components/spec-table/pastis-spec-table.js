import { LitElement, html, css } from 'lit';

export class PastisSpecTable extends LitElement {
  static properties = {
    tokens:  { type: Array },  // CSS custom property names, e.g. ['--space-sm', '--space-md']
    kind:    { type: String, reflect: true }, // 'type' | 'space' | 'radius' | 'motion' | 'color'
    caption: { type: String },
    sample:  { type: String },
    _values: { state: true },
  };

  static styles = css`
    :host { display: block; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
      font-size: 12px;
      color: var(--text-primary, #f9f4da);
    }

    caption {
      text-align: left;
      padding-bottom: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-tertiary, #909498);
    }

    th {
      text-align: left;
      font-weight: 500;
      color: var(--text-tertiary, #909498);
      padding: 8px 12px 8px 0;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    td {
      padding: 14px 12px 14px 0;
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #1e1e1e);
      vertical-align: middle;
    }

    td.value { color: var(--text-tertiary, #909498); white-space: nowrap; }

    .preview { width: 55%; }

    .type-sample {
      font-family: var(--font-family-display, 'Instrument Serif', serif);
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .bar {
      height: 10px;
      background: var(--action-primary, #fcba28);
      border-radius: var(--radius-xs, 2px);
    }

    .radius {
      width: 48px;
      height: 48px;
      border: 2px solid var(--action-primary, #fcba28);
      background: var(--bg-card, #1e1e1e);
    }

    .motion {
      position: relative;
      height: 10px;
      background: var(--bg-elevated, #262522);
      border-radius: var(--radius-full, 9999px);
    }

    .motion::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--action-primary, #fcba28);
      transition-property: left;
      transition-duration: var(--_d);
      transition-timing-function: var(--ease-standard, ease);
    }

    tr:hover .motion::after { left: calc(100% - 10px); }

    .color {
      width: 48px;
      height: 24px;
      border-radius: var(--radius-sm, 4px);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
    }

    @media (max-width: 560px) {
      td.value { display: none; }
      th.value { display: none; }
    }
  `;

  constructor() {
    super();
    this.tokens = [];
    this.kind = 'space';
    this.sample = 'Design systems, Figma ↔ code';
    this._values = {};
  }

  // React 19 assigns server-rendered attribute strings straight to the property
  // on already-upgraded elements, so accept the JSON form as well as an array.
  willUpdate() {
    if (typeof this.tokens === 'string') {
      try { this.tokens = JSON.parse(this.tokens); } catch { this.tokens = []; }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._read();
    this._themeObserver = new MutationObserver(() => this._read());
    this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._themeObserver?.disconnect();
  }

  updated(changed) {
    if (changed.has('tokens')) this._read();
  }

  _read() {
    const styles = getComputedStyle(document.documentElement);
    this._values = Object.fromEntries(
      (Array.isArray(this.tokens) ? this.tokens : []).map((t) => [t, styles.getPropertyValue(t).trim()]),
    );
  }

  _renderPreview(token) {
    switch (this.kind) {
      case 'type':
        return html`<div class="type-sample" style="font-size: var(${token})">${this.sample}</div>`;
      case 'radius':
        return html`<div class="radius" style="border-radius: var(${token})"></div>`;
      case 'motion':
        return html`<div class="motion" style="--_d: var(${token})"></div>`;
      case 'color':
        return html`<div class="color" style="background: var(${token})"></div>`;
      default:
        return html`<div class="bar" style="width: var(${token})"></div>`;
    }
  }

  render() {
    return html`
      <table part="table">
        ${this.caption ? html`<caption>${this.caption}</caption>` : ''}
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col" class="value">Value</th>
            <th scope="col" class="preview">Preview</th>
          </tr>
        </thead>
        <tbody>
          ${(this.tokens || []).map((token) => html`
            <tr>
              <td><code>${token}</code></td>
              <td class="value"><code>${this._values[token] || '—'}</code></td>
              <td class="preview">${this._renderPreview(token)}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('pastis-spec-table', PastisSpecTable);
