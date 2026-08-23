import { LitElement, html, css } from 'lit';

export class PastisThemeToggle extends LitElement {
  static properties = {
    theme:  { type: String, reflect: true }, // 'dark' | 'light'
    size:   { type: String, reflect: true }, // 'sm' | 'md' | 'lg'
    label:  { type: Boolean, reflect: true },
    target: { type: String }, // CSS selector for element to apply data-theme to (default: document.documentElement)
  };

  static styles = css`
    :host { display: inline-block; }

    button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #383c44);
      border-radius: var(--radius-md, 6px);
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      cursor: pointer;
      padding: 0 14px;
      height: 40px;
      transition: box-shadow 120ms ease, background 120ms ease;
    }

    button:hover {
      box-shadow: 4px 4px 0 var(--action-primary, #fcba28);
      background: var(--bg-elevated, #383c44);
    }

    button:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }

    :host([size="sm"]) button { height: 32px; padding: 0 10px; font-size: 11px; }
    :host([size="lg"]) button { height: 48px; padding: 0 20px; font-size: 15px; }

    .icon { font-size: 16px; line-height: 1; }
    :host([size="sm"]) .icon { font-size: 13px; }
    :host([size="lg"]) .icon { font-size: 20px; }

    .label-text { }
  `;

  constructor() {
    super();
    this.theme = 'dark';
    this.size = 'md';
    this.label = true;
  }

  connectedCallback() {
    super.connectedCallback();
    // Sync with current page theme on mount
    const root = this._getTarget();
    if (root) {
      this.theme = root.getAttribute('data-theme') || 'dark';
    }
    // Observe data-theme changes so all instances stay in sync
    this._observer = new MutationObserver(() => {
      const current = this._getTarget()?.getAttribute('data-theme') || 'dark';
      if (current !== this.theme) this.theme = current;
    });
    this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  _getTarget() {
    if (this.target) return document.querySelector(this.target);
    return document.documentElement;
  }

  _toggle() {
    const next = this.theme === 'dark' ? 'light' : 'dark';

    const applyTheme = () => {
      this.theme = next;
      const root = this._getTarget();
      if (root) root.setAttribute('data-theme', next);
      this.dispatchEvent(new CustomEvent('pastis-theme-change', {
        detail: { theme: next },
        bubbles: true, composed: true,
      }));
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const rect = this.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(applyTheme);

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }

  render() {
    const isDark = this.theme === 'dark';
    const icon = isDark ? '☀' : '◑';
    const text = isDark ? 'Light' : 'Dark';

    return html`
      <button @click=${this._toggle} aria-label="Toggle theme: switch to ${text} mode" part="theme-toggle">
        <span class="icon" aria-hidden="true">${icon}</span>
        ${this.label ? html`<span class="label-text">${text} Mode</span>` : ''}
      </button>
    `;
  }
}

customElements.define('pastis-theme-toggle', PastisThemeToggle);
