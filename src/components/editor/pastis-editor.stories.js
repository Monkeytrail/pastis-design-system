import './pastis-editor.js';
import './prose.css';
import '../button/pastis-button.js';

const sample = `
  <h2>Release 2.0</h2>
  <p>Some <strong>bold</strong>, <em>italic</em>, <code>code</code> and a <a href="#notes">link</a>.</p>
  <ul data-type="taskList">
    <li data-checked="false"><label><input type="checkbox" aria-label="Write notes"></label><div><p>Write notes</p></div></li>
    <li data-checked="true"><label><input type="checkbox" checked aria-label="Tag the release"></label><div><p>Tag the release</p></div></li>
  </ul>
  <ol><li><p>First</p></li><li><p>Second</p></li></ol>
  <blockquote><p>A quote</p></blockquote>
  <pre><code>const answer = 42;</code></pre>`;

const toolbar = () => ['Bold', 'Italic', 'Heading', 'List', 'Checklist', 'Code']
  .map((name, i) => `<pastis-button slot="toolbar" size="sm" variant="ghost" aria-pressed="${i === 0}">${name}</pastis-button>`)
  .join('');

/** The shell with a plain contenteditable standing in for the app's editor (Tiptap in todo-pastis). */
function editor(args) {
  const wrap = document.createElement('div');
  wrap.style.maxWidth = '560px';
  wrap.innerHTML = `
    <pastis-editor label="${args.label}" ${args.helper ? `helper="${args.helper}"` : ''} ${args.error ? `error="${args.error}"` : ''} ${args.disabled ? 'disabled' : ''}>
      ${args.toolbar ? toolbar() : ''}
      <div class="pastis-prose" contenteditable="${!args.disabled}" role="textbox" aria-multiline="true" aria-label="${args.label}">${sample}</div>
    </pastis-editor>`;
  return wrap;
}

const panel = (theme) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:16px;flex:1 1 320px;min-width:0;max-width:375px"></section>`;

/**
 * The frame of a rich-text field: label, toolbar slot, the focus ring of the other fields,
 * helper text. The app brings the editor; `prose.css` styles its content.
 */
export default {
  title: 'Basics/Editor',
  component: 'pastis-editor',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    label: { control: 'text' },
    helper: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    toolbar: { control: 'boolean' },
  },
  args: { label: 'Notes', helper: '', error: '', disabled: false, toolbar: true },
  render: editor,
};

export const Default = {};
export const WithHelper = { args: { helper: 'Markdown shortcuts work as you type: # for a heading, - for a list.' } };
export const WithError = { args: { error: 'Notes are too long to save' } };
export const NoToolbar = { args: { toolbar: false } };
export const Disabled = { args: { disabled: true } };

export const BothThemes = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.innerHTML = panel('dark') + panel('light');
    for (const [i, section] of [...wrap.querySelectorAll('section')].entries()) {
      section.append(editor({ label: i === 0 ? 'Notes (dark)' : 'Notes (light)', toolbar: true }));
    }
    return wrap;
  },
};
