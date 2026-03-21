import { LitElement, html, css } from 'lit';

export class PastisToggle extends LitElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    labelPosition: { type: String, attribute: 'label-position' },
    size: { type: String, reflect: true },
    name: { type: String },
  };

  static styles = css`
    :host { display: inline-flex; align-items: center; }

    label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      color: var(--text-secondary, #fff);
    }

    :host([disabled]) label { cursor: not-allowed; opacity: 0.3; }

    input { position: absolute; opacity: 0; width: 0; height: 0; }

    .track {
      display: inline-flex;
      align-items: center;
      position: relative;
      width: 56px;
      height: 28px;
      background: var(--bg-elevated, #383c44);
      border: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      border-radius: var(--radius-full, 9999px);
      transition: border-color 120ms ease;
      flex-shrink: 0;
      padding: 2px;
    }

    :host([size="sm"]) .track { width: 40px; height: 22px; }
    :host([size="lg"]) .track { width: 64px; height: 32px; }

    :host([checked]) .track { border-color: var(--action-primary, #fcba28); }

    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: var(--text-tertiary, #909498);
      border-radius: 50%;
      transition: transform 120ms ease, background 120ms ease;
    }

    :host([size="sm"]) .thumb { width: 10px; height: 10px; }
    :host([size="lg"]) .thumb { width: 20px; height: 20px; }

    :host([checked]) .thumb {
      transform: translateX(28px);
      background: var(--action-primary, #fcba28);
    }

    :host([size="sm"][checked]) .thumb { transform: translateX(18px); }
    :host([size="lg"][checked]) .thumb { transform: translateX(36px); }

    input:focus-visible ~ .track {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .label-text { line-height: 1.4; }
  `;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.labelPosition = 'right';
    this.size = 'md';
  }

  render() {
    const labelEl = this.label ? html`<span class="label-text">${this.label}</span>` : '';
    return html`
      <label>
        ${this.labelPosition === 'left' ? labelEl : ''}
        <input
          type="checkbox"
          .checked="${this.checked}"
          ?disabled="${this.disabled}"
          name="${this.name || ''}"
          role="switch"
          aria-checked="${this.checked}"
          @change="${this._handleChange}"
        />
        <span class="track" aria-hidden="true">
          <span class="thumb"></span>
        </span>
        ${this.labelPosition !== 'left' ? labelEl : ''}
      </label>
    `;
  }

  _handleChange(e) {
    if (this.disabled) return;
    this.checked = e.target.checked;
    this.dispatchEvent(new CustomEvent('pastis-change', {
      detail: { checked: this.checked },
      bubbles: true, composed: true
    }));
  }
}

customElements.define('pastis-toggle', PastisToggle);
