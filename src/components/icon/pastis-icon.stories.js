import './pastis-icon.js';
import { iconNames } from './icons.js';

const gallery = () => `
  <ul style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">
    ${iconNames.map(name => `
      <li style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);color:var(--text-primary)">
        <pastis-icon name="${name}" size="lg"></pastis-icon>
        <code style="font-family:var(--font-family-mono);font-size:var(--font-size-caption);color:var(--text-tertiary)">${name}</code>
      </li>`).join('')}
  </ul>`;

const panel = (theme, content) => `
  <section data-theme="${theme}" aria-label="${theme === 'dark' ? 'Dark' : 'Light'} theme" style="background:var(--bg-primary);color:var(--text-primary);padding:24px;flex:1 1 320px;min-width:0">
    ${content}
  </section>`;

/**
 * Icons from the Pastis set (copied from Lucide v1.71.0, ISC), drawn in `currentColor`.
 *
 * Decorative by default (`aria-hidden="true"`): use it next to text that already says what it
 * means. Give it a `label` when the icon is the only thing carrying the meaning; it is then an
 * image with that name. Inside a button or link with its own text, keep it decorative.
 */
export default {
  title: 'Basics/Icon',
  component: 'pastis-icon',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    name: { control: 'select', options: iconNames },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  render: (args) => `
    <span style="color:var(--text-primary)">
      <pastis-icon name="${args.name}" size="${args.size}" ${args.label ? `label="${args.label}"` : ''}></pastis-icon>
    </span>
  `,
};

export const Default = { args: { name: 'calendar', size: 'md' } };

/** Every icon in the set with its name. */
export const Gallery = { render: gallery };

/** The gallery in both themes: the icons follow the text colour. */
export const BothThemes = {
  render: () => `<div style="display:flex;flex-wrap:wrap">${panel('dark', gallery())}${panel('light', gallery())}</div>`,
};

/** `sm` 16 px, `md` 20 px (default), `lg` 24 px. */
export const Sizes = {
  render: () => `
    <div style="display:flex;gap:24px;align-items:center;color:var(--text-primary);font-family:var(--font-family-mono);font-size:var(--font-size-caption)">
      <span style="display:inline-flex;gap:8px;align-items:center"><pastis-icon name="flag" size="sm"></pastis-icon> sm</span>
      <span style="display:inline-flex;gap:8px;align-items:center"><pastis-icon name="flag" size="md"></pastis-icon> md</span>
      <span style="display:inline-flex;gap:8px;align-items:center"><pastis-icon name="flag" size="lg"></pastis-icon> lg</span>
    </div>
  `,
};

/** The colour comes from `color` (here the error and accent tokens). */
export const Colour = {
  render: () => `
    <p style="display:flex;gap:16px;align-items:center;margin:0;font-family:var(--font-family-body)">
      <span style="display:inline-flex;gap:4px;align-items:center;color:var(--text-error)"><pastis-icon name="alert" size="sm"></pastis-icon> Yesterday 09:00</span>
      <span style="display:inline-flex;gap:4px;align-items:center;color:var(--text-accent)"><pastis-icon name="flag" size="sm"></pastis-icon> Flagged</span>
    </p>
  `,
};

/**
 * Decorative next to text (hidden from assistive technology) versus labelled when the icon stands
 * alone (`role="img"` named by `label`).
 */
export const LabelledVsDecorative = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;color:var(--text-primary);font-family:var(--font-family-body)">
      <span style="display:inline-flex;gap:8px;align-items:center"><pastis-icon name="repeat" size="sm"></pastis-icon> Repeats every week</span>
      <span style="display:inline-flex;gap:8px;align-items:center">Water the plants <pastis-icon name="repeat" size="sm" label="Repeats"></pastis-icon></span>
    </div>
  `,
};
