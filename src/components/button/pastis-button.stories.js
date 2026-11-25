import './pastis-button.js';

export default {
  title: 'Basics/Button',
  component: 'pastis-button',
  tags: ['autodocs'],
  // axe violations fail the story tests (the addon's default only reports them)
  parameters: { a11y: { test: 'error' } },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
  render: (args) => `
    <pastis-button
      variant="${args.variant}"
      size="${args.size}"
      ${args.disabled ? 'disabled' : ''}
      ${args.loading ? 'loading' : ''}
    >${args.label}</pastis-button>
  `,
};

export const Primary = { args: { variant: 'primary', size: 'md', label: '▶ START GAME', disabled: false, loading: false } };
export const Secondary = { args: { variant: 'secondary', size: 'md', label: '◆ SELECT', disabled: false, loading: false } };
export const Ghost = { args: { variant: 'ghost', size: 'md', label: '✕ ABORT', disabled: false, loading: false } };
export const Destructive = { args: { variant: 'destructive', size: 'md', label: '✕ DESTROY', disabled: false, loading: false } };
export const Loading = { args: { variant: 'primary', size: 'md', label: 'LOADING...', loading: true } };
export const Disabled = { args: { variant: 'primary', size: 'md', label: 'LOCKED', disabled: true } };
export const Small = { args: { variant: 'primary', size: 'sm', label: '▶ SMALL' } };
export const Large = { args: { variant: 'primary', size: 'lg', label: '▶ EXECUTE' } };

export const AllVariants = {
  render: () => `
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding:24px;background:#000000;">
      <pastis-button variant="primary">▶ START GAME</pastis-button>
      <pastis-button variant="secondary">◆ SELECT</pastis-button>
      <pastis-button variant="ghost">✕ ABORT</pastis-button>
      <pastis-button variant="destructive">✕ DESTROY</pastis-button>
      <pastis-button loading>LOADING...</pastis-button>
      <pastis-button disabled>LOCKED</pastis-button>
    </div>
  `
};

/**
 * `type="submit"` submits the owning form and `type="reset"` resets it. The default `type` is
 * `button` (native `<button>` defaults to `submit`), so a Pastis button only submits when asked.
 */
export const FormButtons = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:24px;background:#000000;';
    wrap.innerHTML = `
      <form style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">
        <input type="hidden" name="list" value="groceries">
        <pastis-button type="submit" name="intent" value="archive">Archive list</pastis-button>
        <pastis-button type="submit" name="intent" value="duplicate" variant="secondary">Duplicate</pastis-button>
        <pastis-button type="reset" variant="ghost">Reset</pastis-button>
        <pastis-button variant="ghost">Does nothing (type="button")</pastis-button>
      </form>
      <p data-testid="result" aria-live="polite" style="font-family:var(--font-family-mono, monospace);font-size:12px;color:var(--text-secondary, #fff)">No submission yet.</p>
    `;
    const form = wrap.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form, e.submitter);
      wrap.querySelector('[data-testid="result"]').textContent = `Submitted: list=${data.get('list')}, intent=${data.get('intent')}`;
    });
    return wrap;
  },
};

/** ARIA on the host reaches the inner button: icon buttons with `aria-label`, toggles with `aria-pressed`. */
export const AriaPassthrough = {
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;align-items:center;padding:24px;background:#000000;';
    wrap.innerHTML = `
      <div role="group" aria-label="Show" style="display:flex;gap:8px">
        <pastis-button size="sm" variant="ghost" aria-pressed="true">Open</pastis-button>
        <pastis-button size="sm" variant="ghost" aria-pressed="false">Done</pastis-button>
      </div>
      <pastis-button size="sm" variant="ghost" aria-label="Rename Weekend groceries">✎</pastis-button>
      <pastis-button size="sm" variant="destructive" aria-label="Delete Weekend groceries">✕</pastis-button>
      <pastis-button size="sm" variant="secondary" aria-expanded="false" aria-haspopup="menu" aria-controls="list-menu">More ▾</pastis-button>
      <ul id="list-menu" hidden><li>Archive</li></ul>
    `;
    const toggles = wrap.querySelectorAll('[aria-pressed]');
    toggles.forEach((t) => t.addEventListener('pastis-click', () => {
      toggles.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
    }));
    const more = wrap.querySelector('[aria-haspopup]');
    more.addEventListener('pastis-click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      wrap.querySelector('#list-menu').hidden = !open;
    });
    return wrap;
  },
};
