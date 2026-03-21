import { LitElement, html, css } from 'lit';

export class PastisNav extends LitElement {
  static properties = {
    brand:       { type: String },
    items:       { type: Array },
    active:      { type: String },
    sticky:      { type: Boolean, reflect: true },
    variant:     { type: String, reflect: true }, // 'default' | 'minimal'
    _mobileOpen: { state: true },
    _openDropdown: { state: true },
  };

  static styles = css`
    :host { display: block; }

    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0;
      background: var(--bg-card, #1e1e1e);
      border-bottom: var(--border-width, 1px) solid var(--border-default, #fcba28);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      padding: 0 24px;
      height: 64px;
      position: relative;
      z-index: 100;
    }

    :host([sticky]) nav {
      position: sticky;
      top: 0;
    }

    :host([variant="minimal"]) nav {
      background: transparent;
      border-bottom-color: var(--border-subtle, #383c44);
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary, #f9f4da);
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .brand:hover { color: var(--text-primary, #f9f4da); }

    .brand-icon { font-size: 20px; line-height: 1; }

    /* ── Desktop links ── */
    .nav-links {
      display: flex;
      align-items: stretch;
      gap: 0;
      height: 100%;
      flex: 1;
      padding: 0 24px;
    }

    .nav-item {
      position: relative;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 100%;
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 120ms ease;
      border-bottom: var(--border-width, 1px) solid transparent;
      margin-bottom: calc(-1 * var(--border-width, 1px));
    }

    .nav-link:hover {
      color: var(--text-secondary, #fff);
      border-bottom-color: var(--action-secondary, #fc7428);
    }

    .nav-link.active {
      color: var(--text-primary, #f9f4da);
      border-bottom-color: var(--action-primary, #fcba28);
    }

    .nav-link:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -4px;
    }

    .chevron {
      font-size: 9px;
      transition: transform 100ms;
      line-height: 1;
    }

    .chevron-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 8px 0 0;
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: 9px;
      line-height: 1;
    }

    .chevron-btn:focus-visible {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: -4px;
    }

    .nav-item.dropdown-open > .nav-link-wrap .chevron-btn .chevron { transform: rotate(180deg); }

    .nav-link-wrap {
      display: inline-flex;
      align-items: stretch;
      height: 100%;
    }

    /* ── Dropdown ── */
    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 200px;
      background: var(--bg-card, #1e1e1e);
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-md, 6px);
      z-index: 200;
      display: none;
      flex-direction: column;
    }

    .nav-item.dropdown-open > .dropdown { display: flex; }

    .dropdown-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      width: 100%;
      text-align: left;
      transition: background 120ms ease, color 120ms ease;
    }

    .dropdown-link:last-child { border-bottom: none; }

    .dropdown-link:hover {
      background: var(--bg-elevated, #383c44);
      color: var(--text-secondary, #fff);
      box-shadow: inset 4px 0 0 var(--action-secondary, #fc7428);
    }

    .dropdown-link.active {
      color: var(--text-primary, #f9f4da);
      box-shadow: inset 4px 0 0 var(--action-primary, #fcba28);
    }

    /* ── Actions slot ── */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ── Hamburger ── */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      padding: 8px;
      background: none;
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      color: var(--text-primary, #f9f4da);
      flex-shrink: 0;
      transition: box-shadow 120ms ease;
    }

    .hamburger:hover { box-shadow: 4px 4px 0 var(--action-secondary, #fc7428); }
    .hamburger:focus-visible { outline: 2px solid var(--border-focus, #fcba28); outline-offset: 2px; }

    .bar {
      display: block;
      width: 100%;
      height: 3px;
      background: var(--text-primary, #f9f4da);
      transition: transform 100ms, opacity 100ms;
    }

    .hamburger[aria-expanded="true"] .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
    .hamburger[aria-expanded="true"] .bar:nth-child(2) { opacity: 0; }
    .hamburger[aria-expanded="true"] .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

    /* ── Mobile menu ── */
    .mobile-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card, #1e1e1e);
      border-bottom: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-top: none;
      flex-direction: column;
      z-index: 99;
      max-height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .mobile-menu.open { display: flex; }

    .mobile-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      color: var(--text-primary, #f9f4da);
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide, 0.05em);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      width: 100%;
      text-align: left;
      transition: background 120ms ease, color 120ms ease;
    }

    .mobile-link:last-child { border-bottom: none; }
    .mobile-link:hover { background: var(--bg-elevated, #383c44); color: var(--text-secondary, #fff); }
    .mobile-link.active { color: var(--text-primary, #f9f4da); border-left: 4px solid var(--action-primary, #fcba28); padding-left: 20px; }

    .mobile-sub-link {
      padding-left: 48px;
      font-size: 11px;
      background: var(--bg-secondary, #1e1e1e);
    }

    .mobile-sub-link:hover { background: var(--bg-elevated, #383c44); }

    ::slotted([slot="mobile-actions"]) {
      display: block;
      width: 100%;
      margin: 0;
      border-top: var(--border-width, 1px) solid var(--border-subtle, #383c44);
    }

    /* ── Responsive breakpoint ── */
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .nav-actions { display: none; }
      .hamburger { display: flex; }
    }

    @media (min-width: 769px) {
      .mobile-menu { display: none !important; }
    }
  `;

  constructor() {
    super();
    this.items = [];
    this.variant = 'default';
    this.sticky = false;
    this._mobileOpen = false;
    this._openDropdown = null;
    this._boundClose = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._boundClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._boundClose);
  }

  _handleOutsideClick(e) {
    if (!this.contains(e.target)) {
      this._openDropdown = null;
    }
  }

  _toggleMobile() {
    this._mobileOpen = !this._mobileOpen;
  }

  _toggleDropdown(id) {
    this._openDropdown = this._openDropdown === id ? null : id;
  }

  _handleNavClick(item, e) {
    if (item.children?.length) {
      e.preventDefault();
      this._toggleDropdown(item.id);
      return;
    }
    this._mobileOpen = false;
    this._openDropdown = null;
    this.dispatchEvent(new CustomEvent('pastis-nav-click', {
      detail: { item },
      bubbles: true, composed: true,
    }));
  }

  _renderDropdownLink(child) {
    const isActive = this.active === child.id;
    return html`
      <a
        class="dropdown-link ${isActive ? 'active' : ''}"
        href=${child.href || '#'}
        @click=${(e) => this._handleNavClick(child, e)}
      >
        ${child.icon ? html`<span aria-hidden="true">${child.icon}</span>` : ''}
        ${child.label}
      </a>
    `;
  }

  _renderDesktopItem(item) {
    const isActive = this.active === item.id || item.children?.some(c => c.id === this.active);
    const hasChildren = item.children?.length > 0;
    const isOpen = this._openDropdown === item.id;

    return html`
      <div class="nav-item ${isOpen ? 'dropdown-open' : ''}">
        ${hasChildren ? html`
          <div class="nav-link-wrap">
            <a
              class="nav-link ${isActive ? 'active' : ''}"
              href=${item.href || '#'}
              @click=${(e) => this._handleNavClick(item, e)}
            >
              ${item.icon ? html`<span aria-hidden="true">${item.icon}</span>` : ''}
              ${item.label}
            </a>
            <button
              class="chevron-btn"
              aria-haspopup="true"
              aria-expanded=${String(isOpen)}
              aria-label="Toggle ${item.label} submenu"
              @click=${(e) => { e.preventDefault(); this._toggleDropdown(item.id); }}
            ><span class="chevron" aria-hidden="true">▼</span></button>
          </div>
        ` : html`
          <a
            class="nav-link ${isActive ? 'active' : ''}"
            href=${item.href || '#'}
            @click=${(e) => this._handleNavClick(item, e)}
          >
            ${item.icon ? html`<span aria-hidden="true">${item.icon}</span>` : ''}
            ${item.label}
          </a>
        `}
        ${hasChildren ? html`
          <div class="dropdown" role="menu">
            ${item.children.map(child => this._renderDropdownLink(child))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderMobileItem(item) {
    const isActive = this.active === item.id;
    return html`
      <a
        class="mobile-link ${isActive ? 'active' : ''}"
        href=${item.href || '#'}
        @click=${(e) => this._handleNavClick(item, e)}
      >
        ${item.icon ? html`<span aria-hidden="true">${item.icon}</span>` : ''}
        ${item.label}
      </a>
      ${item.children?.map(child => html`
        <a
          class="mobile-link mobile-sub-link ${this.active === child.id ? 'active' : ''}"
          href=${child.href || '#'}
          @click=${(e) => this._handleNavClick(child, e)}
        >
          ${child.icon ? html`<span aria-hidden="true">${child.icon}</span>` : ''}
          ${child.label}
        </a>
      `)}
    `;
  }

  render() {
    return html`
      <nav part="nav" role="navigation" aria-label="Main navigation">
        <!-- Brand -->
        <a class="brand" href="/" part="brand">
          <slot name="brand-icon">
            ${this.brand ? html`<span class="brand-icon">▶</span>` : ''}
          </slot>
          <slot name="brand">${this.brand || ''}</slot>
        </a>

        <!-- Desktop links -->
        <div class="nav-links" role="list">
          ${this.items.map(item => this._renderDesktopItem(item))}
          <slot name="links"></slot>
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <slot name="actions"></slot>
        </div>

        <!-- Hamburger -->
        <button
          class="hamburger"
          aria-label=${this._mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded=${String(this._mobileOpen)}
          aria-controls="mobile-menu"
          @click=${this._toggleMobile}
        >
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </nav>

      <!-- Mobile menu -->
      <div
        id="mobile-menu"
        class="mobile-menu ${this._mobileOpen ? 'open' : ''}"
        part="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
      >
        ${this.items.map(item => this._renderMobileItem(item))}
        <slot name="mobile-links"></slot>
        <slot name="mobile-actions"></slot>
      </div>
    `;
  }
}

customElements.define('pastis-nav', PastisNav);
