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
      background: var(--bg-card, #0A0A0F);
      border-bottom: 4px solid var(--border-default, #00FF41);
      font-family: var(--font-family, 'Courier New', monospace);
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
      border-bottom-color: var(--border-subtle, #1A1A1A);
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary, #00FF41);
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .brand:hover { color: var(--text-primary, #00FF41); }

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
      color: var(--text-tertiary, #808080);
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 50ms;
      border-bottom: 4px solid transparent;
      margin-bottom: -4px; /* align bottom border with nav border */
    }

    .nav-link:hover {
      color: var(--text-secondary, #fff);
      border-bottom-color: var(--action-secondary, #00FFFF);
    }

    .nav-link.active {
      color: var(--text-primary, #00FF41);
      border-bottom-color: var(--action-primary, #00FF41);
    }

    .nav-link:focus-visible {
      outline: 4px solid var(--border-focus, #00FF41);
      outline-offset: -4px;
    }

    .chevron {
      font-size: 9px;
      transition: transform 100ms;
      line-height: 1;
    }

    .nav-item.dropdown-open > .nav-link .chevron { transform: rotate(180deg); }

    /* ── Dropdown ── */
    .dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 200px;
      background: var(--bg-card, #0A0A0F);
      border: 4px solid var(--border-default, #00FF41);
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
      color: var(--text-tertiary, #808080);
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      border-bottom: 2px solid var(--border-subtle, #1A1A1A);
      width: 100%;
      text-align: left;
      transition: background 50ms, color 50ms;
    }

    .dropdown-link:last-child { border-bottom: none; }

    .dropdown-link:hover {
      background: var(--bg-elevated, #1A1A1A);
      color: var(--text-secondary, #fff);
      box-shadow: inset 4px 0 0 var(--action-secondary, #00FFFF);
    }

    .dropdown-link.active {
      color: var(--text-primary, #00FF41);
      box-shadow: inset 4px 0 0 var(--action-primary, #00FF41);
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
      border: 3px solid var(--border-default, #00FF41);
      cursor: pointer;
      color: var(--text-primary, #00FF41);
      flex-shrink: 0;
      transition: box-shadow 50ms;
    }

    .hamburger:hover { box-shadow: 4px 4px 0 var(--action-secondary, #00FFFF); }
    .hamburger:focus-visible { outline: 4px solid var(--border-focus, #00FF41); outline-offset: 2px; }

    .bar {
      display: block;
      width: 100%;
      height: 3px;
      background: var(--text-primary, #00FF41);
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
      background: var(--bg-card, #0A0A0F);
      border-bottom: 4px solid var(--border-default, #00FF41);
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
      color: var(--text-tertiary, #808080);
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      border-bottom: 2px solid var(--border-subtle, #1A1A1A);
      width: 100%;
      text-align: left;
      transition: background 50ms, color 50ms;
    }

    .mobile-link:last-child { border-bottom: none; }
    .mobile-link:hover { background: var(--bg-elevated, #1A1A1A); color: var(--text-secondary, #fff); }
    .mobile-link.active { color: var(--text-primary, #00FF41); border-left: 4px solid var(--action-primary, #00FF41); padding-left: 20px; }

    .mobile-sub-link {
      padding-left: 48px;
      font-size: 11px;
      background: var(--bg-secondary, #0A0A0F);
    }

    .mobile-sub-link:hover { background: var(--bg-elevated, #1A1A1A); }

    ::slotted([slot="mobile-actions"]) {
      display: block;
      width: 100%;
      margin: 0;
      border-top: 4px solid var(--border-subtle, #1A1A1A);
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
        <a
          class="nav-link ${isActive ? 'active' : ''}"
          href=${item.href || '#'}
          role=${hasChildren ? 'button' : undefined}
          aria-haspopup=${hasChildren ? 'true' : undefined}
          aria-expanded=${hasChildren ? String(isOpen) : undefined}
          @click=${(e) => this._handleNavClick(item, e)}
        >
          ${item.icon ? html`<span aria-hidden="true">${item.icon}</span>` : ''}
          ${item.label}
          ${hasChildren ? html`<span class="chevron" aria-hidden="true">▼</span>` : ''}
        </a>
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
