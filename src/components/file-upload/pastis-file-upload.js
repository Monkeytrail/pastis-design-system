import { LitElement, html, css } from 'lit';

export class PastisFileUpload extends LitElement {
  static properties = {
    accept: { type: String },
    multiple: { type: Boolean, reflect: true },
    maxSize: { type: Number, attribute: 'max-size' },
    disabled: { type: Boolean, reflect: true },
    label: { type: String },
    helper: { type: String },
    dragover: { type: Boolean, reflect: true },
    files: { type: Array, attribute: false },
    variant: { type: String, reflect: true },
    error: { type: String, attribute: false },
    maxFiles: { type: Number, attribute: 'max-files' },
  };

  static styles = css`
    :host { display: block; }

    .field { display: flex; flex-direction: column; gap: 6px; }

    .field-label {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-primary, #00FF41);
    }

    .dropzone {
      border: 4px dashed var(--border-default, #00FF41);
      border-radius: 0;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: background 50ms, box-shadow 50ms;
      background: var(--bg-card, #0A0A0F);
    }

    .dropzone:hover, :host([dragover]) .dropzone {
      background: rgba(0, 255, 65, 0.05);
      box-shadow: 6px 6px 0 var(--action-secondary, #00FFFF);
    }

    :host([disabled]) .dropzone {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }

    .has-error .dropzone {
      border-color: var(--status-error, #FF006E);
    }

    .upload-icon {
      font-size: 28px;
      margin-bottom: 12px;
      display: block;
    }

    .upload-text {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-secondary, #fff);
      margin: 0 0 6px;
    }

    .upload-sub {
      font-family: var(--font-family, 'Courier New', monospace);
      font-size: 11px;
      color: var(--text-tertiary, #808080);
      margin: 0;
    }

    .browse-link {
      color: var(--text-primary, #00FF41);
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    input[type="file"] { display: none; }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-primary, #000);
      border: 3px solid var(--border-subtle, #1A1A1A);
      border-radius: 0;
      font-family: var(--font-family, 'Courier New', monospace);
    }

    .file-icon { font-size: 18px; flex-shrink: 0; }

    .file-info { flex: 1; min-width: 0; }

    .file-name {
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--text-secondary, #fff);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      font-size: 10px;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--text-tertiary, #808080);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .remove-file {
      background: none;
      border: 2px solid var(--text-tertiary, #808080);
      border-radius: 0;
      cursor: pointer;
      color: var(--text-tertiary, #808080);
      font-size: 12px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      padding: 4px 6px;
      transition: color 50ms, border-color 50ms;
    }

    .remove-file:hover { color: var(--status-error, #FF006E); border-color: var(--status-error, #FF006E); }

    .error-text {
      font-size: 11px;
      font-family: var(--font-family, 'Courier New', monospace);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--status-error, #FF006E);
    }

    .helper-text {
      font-size: 11px;
      font-family: var(--font-family, 'Courier New', monospace);
      color: var(--text-tertiary, #808080);
    }

    .progress-bar {
      height: 8px;
      background: var(--bg-elevated, #1A1A1A);
      border: 2px solid var(--border-default, #00FF41);
      border-radius: 0;
      overflow: hidden;
      margin-top: 4px;
    }

    .progress-fill {
      height: 100%;
      background: var(--action-primary, #00FF41);
      border-radius: 0;
      transition: width 100ms steps(10);
    }
  `;

  constructor() {
    super();
    this.files = [];
    this.multiple = false;
    this.disabled = false;
    this.dragover = false;
    this.maxSize = 10; // MB
    this.maxFiles = 10;
    this.error = '';
  }

  _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  _getFileIcon(file) {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('spreadsheet') || type.includes('excel') || type.name?.endsWith('.xlsx')) return '📊';
    return '📎';
  }

  _processFiles(fileList) {
    this.error = '';
    const newFiles = Array.from(fileList);

    for (const file of newFiles) {
      if (file.size > this.maxSize * 1024 * 1024) {
        this.error = `File "${file.name}" exceeds the ${this.maxSize}MB limit.`;
        return;
      }
    }

    if (!this.multiple) {
      this.files = newFiles.slice(0, 1);
    } else {
      const combined = [...this.files, ...newFiles];
      if (combined.length > this.maxFiles) {
        this.error = `Maximum ${this.maxFiles} files allowed.`;
        return;
      }
      this.files = combined;
    }

    this.dispatchEvent(new CustomEvent('pastis-files-change', {
      detail: { files: this.files },
      bubbles: true, composed: true
    }));
    this.requestUpdate();
  }

  _handleDrop(e) {
    e.preventDefault();
    this.dragover = false;
    if (this.disabled) return;
    this._processFiles(e.dataTransfer.files);
  }

  _handleFileInput(e) {
    this._processFiles(e.target.files);
    e.target.value = '';
  }

  _removeFile(index) {
    this.files = this.files.filter((_, i) => i !== index);
    this.dispatchEvent(new CustomEvent('pastis-files-change', {
      detail: { files: this.files },
      bubbles: true, composed: true
    }));
    this.requestUpdate();
  }

  _openPicker() {
    if (this.disabled) return;
    this.shadowRoot?.querySelector('input[type="file"]')?.click();
  }

  render() {
    return html`
      <div class="field ${this.error ? 'has-error' : ''}">
        ${this.label ? html`<span class="field-label">${this.label}</span>` : ''}

        <div
          class="dropzone"
          @click="${this._openPicker}"
          @dragover="${e => { e.preventDefault(); this.dragover = true; }}"
          @dragleave="${() => { this.dragover = false; }}"
          @drop="${this._handleDrop}"
          role="button"
          tabindex="${this.disabled ? -1 : 0}"
          @keydown="${e => (e.key === 'Enter' || e.key === ' ') && this._openPicker()}"
          aria-label="Upload files"
          part="dropzone"
        >
          <span class="upload-icon">📁</span>
          <p class="upload-text">
            <span class="browse-link">Choose files</span> or drag & drop
          </p>
          <p class="upload-sub">
            ${this.accept ? `Supported: ${this.accept}` : 'Any file type accepted'}
            · Max ${this.maxSize}MB${this.multiple ? ` · Up to ${this.maxFiles} files` : ''}
          </p>
        </div>

        <input
          type="file"
          accept="${this.accept || ''}"
          ?multiple="${this.multiple}"
          @change="${this._handleFileInput}"
        />

        ${this.files.length ? html`
          <div class="file-list">
            ${this.files.map((file, i) => html`
              <div class="file-item" part="file-item">
                <span class="file-icon">${this._getFileIcon(file)}</span>
                <div class="file-info">
                  <div class="file-name">${file.name}</div>
                  <div class="file-size">${this._formatSize(file.size)}</div>
                </div>
                <button
                  class="remove-file"
                  @click="${e => { e.stopPropagation(); this._removeFile(i); }}"
                  aria-label="Remove ${file.name}"
                >✕</button>
              </div>
            `)}
          </div>
        ` : ''}

        ${this.error ? html`<p class="error-text">⚠ ${this.error}</p>` : ''}
        ${this.helper && !this.error ? html`<p class="helper-text">${this.helper}</p>` : ''}
      </div>
    `;
  }
}

customElements.define('pastis-file-upload', PastisFileUpload);
