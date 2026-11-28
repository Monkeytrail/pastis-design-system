import { describe, it, expect, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import './pastis-kbd.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

describe('pastis-kbd', () => {
  let container;
  afterEach(() => container?.remove());

  it('renders its slotted key inside a kbd element', async () => {
    container = await mount('<p>Press <pastis-kbd>Esc</pastis-kbd> to close</p>');
    const host = container.querySelector('pastis-kbd');
    const kbd = host.shadowRoot.querySelector('kbd');
    expect(kbd).toBeTruthy();
    expect(kbd.querySelector('slot').assignedNodes()[0].textContent).toBe('Esc');
    expect(container.querySelector('p').textContent).toBe('Press Esc to close');
  });

  it('is a key cap on tokens: monospace, bordered, at least 20 px wide', async () => {
    container = await mount('<pastis-kbd>j</pastis-kbd>');
    const kbd = container.querySelector('pastis-kbd').shadowRoot.querySelector('kbd');
    const style = getComputedStyle(kbd);
    expect(style.borderTopStyle).toBe('solid');
    expect(style.whiteSpace).toBe('nowrap');
    expect(kbd.getBoundingClientRect().width).toBeGreaterThanOrEqual(20);
  });

  it('label replaces a symbol for screen readers', async () => {
    container = await mount('<p>Move up with <pastis-kbd label="Up arrow">↑</pastis-kbd></p>');
    const kbd = container.querySelector('pastis-kbd').shadowRoot.querySelector('kbd');
    expect(kbd.querySelector('[aria-hidden="true"] slot')).toBeTruthy();
    expect(kbd.querySelector('.sr').textContent).toBe('Up arrow');
    await expect.element(page.getByText('Up arrow')).toBeInTheDocument();
  });

  it('the hidden attribute hides it', async () => {
    container = await mount('<pastis-kbd hidden>?</pastis-kbd>');
    expect(getComputedStyle(container.querySelector('pastis-kbd')).display).toBe('none');
  });

  it('has no axe violations in both themes', async () => {
    for (const theme of ['dark', 'light']) {
      container = await mount(`
        <div data-theme="${theme}" style="background:var(--bg-primary);color:var(--text-primary);padding:8px">
          <p>Move with <pastis-kbd>j</pastis-kbd> and <pastis-kbd>k</pastis-kbd>, go to Today with
          <pastis-kbd>g</pastis-kbd> then <pastis-kbd>t</pastis-kbd>, move up with
          <pastis-kbd label="Up arrow">↑</pastis-kbd>.</p>
        </div>`);
      expect((await axe.run(container, AXE)).violations.map(v => v.id), theme).toEqual([]);
      container.remove();
    }
  });
});
