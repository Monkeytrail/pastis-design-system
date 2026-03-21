import { LitElement, html, css } from 'lit';

export class PastisTable extends LitElement {
  static properties = {
    columns: { type: Array },
    rows:    { type: Array },
    selectable: { type: Boolean, reflect: true },
    selected:   { type: Array },
    striped:    { type: Boolean, reflect: true },
    hoverable:  { type: Boolean, reflect: true },
    loading:    { type: Boolean, reflect: true },
    emptyText:  { type: String },
  };

  static styles = css`
    :host { display: block; overflow-x: auto; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      border: 4px solid var(--border-default, #00FF41);
    }

    thead { background: var(--bg-elevated, #1A1A1A); }

    th {
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-primary, #00FF41);
      border-bottom: 4px solid var(--border-default, #00FF41);
      white-space: nowrap;
    }

    td {
      padding: 10px 14px;
      color: var(--text-secondary, #fff);
      border-bottom: 2px solid var(--border-subtle, #1A1A1A);
      vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }

    :host([striped]) tr:nth-child(even) td { background: var(--bg-secondary, #0A0A0F); }

    :host([hoverable]) tbody tr:hover td { background: var(--bg-elevated, #1A1A1A); cursor: pointer; }

    .row-selected td { background: color-mix(in srgb, var(--action-primary, #00FF41) 12%, transparent); }

    .checkbox-cell {
      width: 44px;
      padding: 10px;
    }

    .checkbox-visual {
      width: 16px;
      height: 16px;
      border: 3px solid var(--border-default, #00FF41);
      background: var(--bg-primary, #000);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--action-primary, #00FF41);
      font-size: 11px;
      font-weight: 700;
    }

    .empty-row td {
      text-align: center;
      color: var(--text-tertiary, #808080);
      padding: 32px;
    }

    .skeleton-cell {
      height: 12px;
      background: var(--bg-elevated, #1A1A1A);
      animation: pulse 1s steps(2) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `;

  constructor() {
    super();
    this.columns = [];
    this.rows = [];
    this.selected = [];
    this.striped = false;
    this.hoverable = false;
    this.loading = false;
    this.emptyText = 'No data found.';
  }

  _isSelected(rowId) { return this.selected.includes(rowId); }

  _toggleRow(rowId) {
    const s = this._isSelected(rowId)
      ? this.selected.filter(id => id !== rowId)
      : [...this.selected, rowId];
    this.selected = s;
    this.dispatchEvent(new CustomEvent('pastis-select', { detail: { selected: s }, bubbles: true, composed: true }));
  }

  _toggleAll() {
    const allIds = this.rows.map(r => r.id);
    const allSelected = allIds.every(id => this.selected.includes(id));
    this.selected = allSelected ? [] : allIds;
    this.dispatchEvent(new CustomEvent('pastis-select', { detail: { selected: this.selected }, bubbles: true, composed: true }));
  }

  render() {
    const allSelected = this.rows.length > 0 && this.rows.every(r => this._isSelected(r.id));
    return html`
      <table part="table">
        <thead>
          <tr>
            ${this.selectable ? html`
              <th class="checkbox-cell">
                <span class="checkbox-visual" @click=${this._toggleAll}>${allSelected ? '✓' : ''}</span>
              </th>
            ` : ''}
            ${this.columns.map(col => html`<th>${col.label || col.key}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${this.loading ? Array(4).fill(0).map(() => html`
            <tr>
              ${this.selectable ? html`<td class="checkbox-cell"></td>` : ''}
              ${this.columns.map(() => html`<td><div class="skeleton-cell"></div></td>`)}
            </tr>
          `) : this.rows.length === 0 ? html`
            <tr class="empty-row">
              <td colspan=${this.columns.length + (this.selectable ? 1 : 0)}>${this.emptyText}</td>
            </tr>
          ` : this.rows.map(row => html`
            <tr class=${this._isSelected(row.id) ? 'row-selected' : ''}>
              ${this.selectable ? html`
                <td class="checkbox-cell">
                  <span class="checkbox-visual" @click=${() => this._toggleRow(row.id)}>${this._isSelected(row.id) ? '✓' : ''}</span>
                </td>
              ` : ''}
              ${this.columns.map(col => html`<td>${row[col.key] ?? '—'}</td>`)}
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }
}

customElements.define('pastis-table', PastisTable);
