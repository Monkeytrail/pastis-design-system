import { describe, it, expect, afterEach } from 'vitest';
import axe from 'axe-core';
// The tokens (not index.css, which loads web fonts), so both themes resolve
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './prose.css';
import './pastis-editor.js';
import '../button/pastis-button.js';

const DOC = `
  <h2>Release</h2>
  <p>Some <strong>bold</strong>, <em>italic</em>, <code>code</code> and a <a href="#x">link</a>.</p>
  <ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked aria-label="Done: notes"></label><div><p>Notes</p></div></li></ul>
  <blockquote><p>A quote</p></blockquote>
  <pre><code>const answer = 42;</code></pre>`;

async function mountEditor(attrs = '', { toolbar = true, wrap = s => s } = {}) {
  const container = document.createElement('div');
  container.innerHTML = wrap(`
    <pastis-editor label="Notes" ${attrs}>
      ${toolbar ? '<pastis-button slot="toolbar" size="sm" aria-pressed="false">Bold</pastis-button>' : ''}
      <div class="pastis-prose" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Notes">${DOC}</div>
    </pastis-editor>`);
  document.body.appendChild(container);
  const editor = container.querySelector('pastis-editor');
  await editor.updateComplete;
  await new Promise(requestAnimationFrame);
  await editor.updateComplete;
  return { container, editor, frame: editor.shadowRoot.querySelector('.frame') };
}

describe('pastis-editor', () => {
  let container;
  afterEach(() => container?.remove());

  it('shows the label, the toolbar when it has buttons, and the content', async () => {
    const m = await mountEditor();
    container = m.container;
    expect(m.editor.shadowRoot.querySelector('.label').textContent).toBe('Notes');
    expect(m.editor.shadowRoot.querySelector('.toolbar').classList.contains('filled')).toBe(true);
    const empty = await mountEditor('', { toolbar: false });
    expect(getComputedStyle(empty.editor.shadowRoot.querySelector('.toolbar')).display).toBe('none');
    empty.container.remove();
  });

  it('draws the focus ring while the slotted editor has focus', async () => {
    const m = await mountEditor();
    container = m.container;
    expect(getComputedStyle(m.frame).outlineStyle).toBe('none');
    m.container.querySelector('[contenteditable]').focus();
    expect(getComputedStyle(m.frame).outlineStyle).toBe('solid');
  });

  it('disabled makes the slotted editor and toolbar inert, until enabled again', async () => {
    const m = await mountEditor('disabled');
    container = m.container;
    const editable = m.container.querySelector('[contenteditable]');
    const button = m.container.querySelector('pastis-button');
    expect(editable.inert).toBe(true);
    expect(button.inert).toBe(true);
    m.editor.disabled = false;
    await m.editor.updateComplete;
    expect(editable.inert).toBe(false);
  });

  it('a tap on the empty part of the field focuses the editor', async () => {
    const m = await mountEditor();
    container = m.container;
    m.editor.shadowRoot.querySelector('.content').click();
    expect(document.activeElement).toBe(m.container.querySelector('[contenteditable]'));
  });

  it('shows helper text, or an error instead', async () => {
    const m = await mountEditor('helper="Markdown is kept as typed"');
    container = m.container;
    expect(m.editor.shadowRoot.querySelector('.helper-text').textContent).toBe('Markdown is kept as typed');
    m.editor.error = 'Too long';
    await m.editor.updateComplete;
    expect(m.editor.shadowRoot.querySelector('[role="alert"]').textContent).toBe('Too long');
    expect(m.editor.shadowRoot.querySelector('.helper-text')).toBeNull();
  });

  it('prose.css styles the slotted content: task lists, code, quotes', async () => {
    const m = await mountEditor();
    container = m.container;
    const content = m.container.querySelector('.pastis-prose');
    expect(getComputedStyle(content.querySelector('ul[data-type="taskList"]')).listStyleType).toBe('none');
    expect(getComputedStyle(content.querySelector('li[data-checked="true"] > div')).textDecorationLine).toBe('line-through');
    expect(getComputedStyle(content.querySelector('pre')).overflowX).toBe('auto');
  });

  it('axe (all rules) is clean in both themes, content included', async () => {
    for (const [theme, bg] of [['dark', '#110d0a'], ['light', '#f4f1ea']]) {
      const m = await mountEditor('', { wrap: s => `<main data-theme="${theme}" style="background:${bg};color:var(--text-primary)"><h1>Item</h1>${s}</main>` });
      container = m.container;
      const results = await axe.run(container);
      expect(results.violations, theme).toEqual([]);
      container.remove();
    }
  });
});
