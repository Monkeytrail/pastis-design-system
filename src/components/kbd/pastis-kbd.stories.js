import './pastis-kbd.js';

/** A key cap for keyboard shortcuts and hints. */
export default {
  title: 'Basics/Kbd',
  component: 'pastis-kbd',
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
  argTypes: { key: { control: 'text' } },
  args: { key: 'Esc' },
  render: ({ key }) => {
    const wrap = document.createElement('p');
    wrap.style.color = 'var(--text-primary)';
    wrap.append('Press ');
    const kbd = document.createElement('pastis-kbd');
    kbd.textContent = key;
    wrap.append(kbd, ' to close the item.');
    return wrap;
  },
};

export const Default = {};

export const Sequence = {
  render: () => {
    const wrap = document.createElement('p');
    wrap.style.color = 'var(--text-primary)';
    wrap.innerHTML = 'Go to Today: <pastis-kbd>g</pastis-kbd> then <pastis-kbd>t</pastis-kbd>';
    return wrap;
  },
};

export const ShortcutSheet = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <dl style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin:0;color:var(--text-primary);font-family:var(--font-family-body)">
        <dt><pastis-kbd>j</pastis-kbd> <pastis-kbd label="Down arrow">↓</pastis-kbd></dt><dd style="margin:0">Next item</dd>
        <dt><pastis-kbd>k</pastis-kbd> <pastis-kbd label="Up arrow">↑</pastis-kbd></dt><dd style="margin:0">Previous item</dd>
        <dt><pastis-kbd>x</pastis-kbd></dt><dd style="margin:0">Complete or reopen</dd>
        <dt><pastis-kbd>n</pastis-kbd></dt><dd style="margin:0">New item</dd>
        <dt><pastis-kbd>Esc</pastis-kbd></dt><dd style="margin:0">Close the item</dd>
      </dl>`;
    return wrap;
  },
};
