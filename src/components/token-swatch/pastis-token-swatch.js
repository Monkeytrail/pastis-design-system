import { LitElement, html, css } from 'lit';

export class PastisTokenSwatch extends LitElement {
  static properties = {
    token:  { type: String }, // CSS custom property, e.g. '--action-primary'
    label:  { type: String },
    _value: { state: true },
  };

  static styles = css`
    :host { display: block; }

    figure {
      margin: 0;
      display: flex;
      flex-direction: column;
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      overflow: hidden;
      background: var(--bg-card, #1e1e1e);
      font-family: var(--font-family-mono, 'JetBrains Mono', monospace);
    }

    .chip {
      aspect-ratio: 3 / 2;
      border-bottom: var(--border-width, 1px) solid var(--border-default, #383c44);
      transition: background var(--duration-base, 200ms) var(--ease-standard, ease);
    }

    figcaption {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 10px 12px;
    }

    .label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary, #f9f4da);
    }

    .token,
    .value {
      font-size: 11px;
      color: var(--text-tertiary, #909498);
      overflow-wrap: anywhere;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._read();
    // Re-read when the theme flips so the swatch always shows the live value
    this._themeObserver = new MutationObserver(() => this._read());
    this._themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._themeObserver?.disconnect();
  }

  updated(changed) {
    if (changed.has('token')) this._read();
  }

  _read() {
    if (!this.token) return;
    this._value = getComputedStyle(document.documentElement).getPropertyValue(this.token).trim();
  }

  render() {
    return html`
      <figure part="swatch">
        <div class="chip" style="background: var(${this.token})" aria-hidden="true"></div>
        <figcaption>
          <span class="label">${this.label || this.token}</span>
          <code class="token">${this.token}</code>
          <code class="value">${this._value || '—'}</code>
        </figcaption>
      </figure>
    `;
  }
}

customElements.define('pastis-token-swatch', PastisTokenSwatch);
