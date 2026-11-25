import { describe, it, expect, afterEach, vi } from 'vitest';
import { cdp, page } from 'vitest/browser';
import axe from 'axe-core';
import { icons, iconNames } from './pastis-icon.js';
import * as pastis from '../../index.js';

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  return container;
}

/** Every accessibility-tree node (Chrome's own) of the test page. */
async function axNodes() {
  const session = cdp();
  await session.send('Accessibility.enable');
  const { frameTree } = await session.send('Page.getFrameTree');
  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frameTree.childFrames[0].frame.id });
  return nodes.filter(n => !n.ignored);
}

const INITIAL_SET = [
  'today', 'calendar', 'list', 'search', 'flag', 'repeat', 'clock', 'tag', 'subtasks', 'alert',
  'plus', 'check', 'close', 'more', 'edit', 'trash', 'chevron-right', 'chevron-left', 'inbox',
  'trash-restore',
];

describe('pastis-icon', () => {
  let container;
  afterEach(() => {
    container?.remove();
    vi.restoreAllMocks();
  });

  // ─── The set ──────────────────────────────────────────────────────────────

  it('has the initial set, exported from the package', () => {
    expect([...iconNames].sort()).toEqual([...INITIAL_SET].sort());
    expect(pastis.iconNames).toBe(iconNames);
    expect(pastis.icons).toBe(icons);
    expect(customElements.get('pastis-icon')).toBe(pastis.PastisIcon);
  });

  it.each(INITIAL_SET)('"%s" renders a 24 × 24 stroked SVG in currentColor', async (name) => {
    container = await mount(`<pastis-icon name="${name}"></pastis-icon>`);
    const svg = container.querySelector('pastis-icon').shadowRoot.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.children.length).toBeGreaterThan(0);
    // No fill that ignores the colour
    for (const child of svg.querySelectorAll('[fill]')) expect(child.getAttribute('fill')).toBe('currentColor');
    expect(svg.getBBox().width).toBeGreaterThan(0);
  });

  // ─── Size ─────────────────────────────────────────────────────────────────

  it.each([
    ['sm', 16],
    ['md', 20],
    ['lg', 24],
  ])('size "%s" is %i px', async (size, px) => {
    container = await mount(`<pastis-icon name="calendar" size="${size}"></pastis-icon>`);
    const rect = container.querySelector('pastis-icon').getBoundingClientRect();
    expect(rect.width).toBe(px);
    expect(rect.height).toBe(px);
  });

  it('defaults to md (20 px)', async () => {
    container = await mount('<pastis-icon name="calendar"></pastis-icon>');
    const icon = container.querySelector('pastis-icon');
    expect(icon.size).toBe('md');
    expect(icon.getBoundingClientRect().width).toBe(20);
  });

  it('--pastis-icon-size overrides the size', async () => {
    container = await mount('<pastis-icon name="calendar" style="--pastis-icon-size: 32px"></pastis-icon>');
    expect(container.querySelector('pastis-icon').getBoundingClientRect().width).toBe(32);
  });

  // ─── Colour ───────────────────────────────────────────────────────────────

  it('follows the text colour', async () => {
    container = await mount('<p style="color: rgb(240, 80, 94)"><pastis-icon name="alert"></pastis-icon></p>');
    const icon = container.querySelector('pastis-icon');
    const svg = icon.shadowRoot.querySelector('svg');
    expect(getComputedStyle(svg).stroke).toBe('rgb(240, 80, 94)');
    container.querySelector('p').style.color = 'rgb(252, 186, 40)';
    expect(getComputedStyle(svg).stroke).toBe('rgb(252, 186, 40)');
  });

  // ─── Semantics ────────────────────────────────────────────────────────────

  it('is decorative by default: aria-hidden, no role, out of the accessibility tree', async () => {
    container = await mount('<p>Repeats every week <pastis-icon name="repeat"></pastis-icon></p>');
    const icon = container.querySelector('pastis-icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('role')).toBe(false);
    expect((await axNodes()).filter(n => n.role?.value === 'image')).toHaveLength(0);
  });

  it('with label it is an image named by the label', async () => {
    container = await mount('<p>Water the plants <pastis-icon name="repeat" label="Repeats"></pastis-icon></p>');
    const icon = container.querySelector('pastis-icon');
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Repeats');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
    await expect.element(page.getByRole('img', { name: 'Repeats' })).toBeInTheDocument();
    const images = (await axNodes()).filter(n => n.role?.value === 'image');
    expect(images).toHaveLength(1);
    expect(images[0].name.value).toBe('Repeats');
  });

  it('removing the label makes it decorative again', async () => {
    container = await mount('<pastis-icon name="flag" label="Flagged"></pastis-icon>');
    const icon = container.querySelector('pastis-icon');
    icon.label = '';
    await icon.updateComplete;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('role')).toBe(false);
    expect(icon.hasAttribute('aria-label')).toBe(false);
  });

  // ─── Unknown name ─────────────────────────────────────────────────────────

  it('an unknown name renders nothing and warns once, naming it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    container = await mount('<pastis-icon name="rocket"></pastis-icon>');
    const icon = container.querySelector('pastis-icon');
    expect(icon.shadowRoot.querySelector('svg')).toBeNull();
    icon.size = 'lg';
    await icon.updateComplete;
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"rocket"');
  });

  it('a name from Object.prototype is unknown', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    container = await mount('<pastis-icon name="constructor"></pastis-icon>');
    expect(container.querySelector('pastis-icon').shadowRoot.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('switching to a known name renders it', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    container = await mount('<pastis-icon name="rocket"></pastis-icon>');
    const icon = container.querySelector('pastis-icon');
    icon.name = 'check';
    await icon.updateComplete;
    expect(icon.shadowRoot.querySelector('svg')).toBeTruthy();
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  it('axe (all rules) is clean for every icon, decorative and labelled', async () => {
    container = await mount(`
      <main style="background:#0d0d0d;color:#f4eee3">
        <h1>Icons</h1>
        <p>${iconNames.map(n => `<pastis-icon name="${n}"></pastis-icon>`).join('')}</p>
        <p>${iconNames.map(n => `<pastis-icon name="${n}" label="${n}"></pastis-icon>`).join('')}</p>
      </main>`);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
