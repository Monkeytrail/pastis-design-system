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
      font-family: var(--font-family-mono, 'Fira Code', monospace);
      font-size: 13px;
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-md, 6px);
    }

    thead { background: var(--bg-elevated, #383c44); }

    th {
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-primary, #f9f4da);
      border-bottom: var(--border-width, 1px) solid var(--border-default, #fcba28);
      white-space: nowrap;
    }

    td {
      padding: 10px 14px;
      color: var(--text-secondary, #fff);
      border-bottom: var(--border-width, 1px) solid var(--border-subtle, #383c44);
      vertical-align: middle;
    }

    tr:last-child td { border-bottom: none; }

    :host([striped]) tr:nth-child(even) td { background: var(--bg-secondary, #1e1e1e); }

    :host([hoverable]) tbody tr:hover td { background: var(--bg-elevated, #383c44); cursor: pointer; }

    .row-selected td { background: color-mix(in srgb, var(--action-primary, #fcba28) 12%, transparent); }

    .checkbox-cell {
      width: 44px;
      padding: 10px;
    }

    .checkbox-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }

    .checkbox-real {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      margin: 0;
    }

    .checkbox-visual {
      width: 16px;
      height: 16px;
      border: var(--border-width, 1px) solid var(--border-default, #fcba28);
      border-radius: var(--radius-sm, 4px);
      background: var(--bg-primary, #0d0d0d);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--action-primary, #fcba28);
      font-size: 11px;
      font-weight: 700;
      pointer-events: none;
    }

    .checkbox-real:focus-visible + .checkbox-visual {
      outline: 2px solid var(--border-focus, #fcba28);
      outline-offset: 2px;
    }

    .empty-row td {
      text-align: center;
      color: var(--text-tertiary, #909498);
      padding: 32px;
    }

    .skeleton-cell {
      height: 12px;
      background: var(--bg-elevated, #383c44);
      border-radius: var(--radius-sm, 4px);
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
                <label class="checkbox-wrapper">
                  <input
                    class="checkbox-real"
                    type="checkbox"
                    .checked=${allSelected}
                    aria-label="Select all rows"
                    @change=${this._toggleAll}
                  />
                  <span class="checkbox-visual" aria-hidden="true">${allSelected ? '✓' : ''}</span>
                </label>
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
                  <label class="checkbox-wrapper">
                    <input
                      class="checkbox-real"
                      type="checkbox"
                      .checked=${this._isSelected(row.id)}
                      aria-label="Select row"
                      @change=${() => this._toggleRow(row.id)}
                    />
                    <span class="checkbox-visual" aria-hidden="true">${this._isSelected(row.id) ? '✓' : ''}</span>
                  </label>
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
