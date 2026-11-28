import { describe, it, expect, afterEach, afterAll } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import axe from 'axe-core';
import '../../tokens/colors.css';
import '../../tokens/spacing.css';
import '../../tokens/typography.css';
import '../../tokens/motion.css';
import './pastis-app-layout.js';
import '../sidebar/pastis-sidebar.js';

const AXE = { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] };
const initial = { width: window.innerWidth, height: window.innerHeight };

async function mount(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.appendChild(container);
  await Promise.all([...container.querySelectorAll('*')].map(n => n.updateComplete).filter(Boolean));
  await settle();
  return container;
}

/** Two frames: the resize observation, then the render it causes. */
async function settle() {
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  const layout = document.querySelector('pastis-app-layout');
  await layout?.updateComplete;
}

const layout = (attrs = '', main = '<h1>Today</h1><p>Three items due.</p>') => `
  <pastis-app-layout ${attrs}>
    <pastis-sidebar slot="sidebar" label="Views">
      <pastis-sidebar-item href="/today" icon="today" label="Today" current></pastis-sidebar-item>
      <pastis-sidebar-item href="/all" icon="layers" label="All"></pastis-sidebar-item>
    </pastis-sidebar>
    ${main}
    <div slot="detail"><h2>Buy oat milk</h2><p>Due today.</p></div>
  </pastis-app-layout>`;

describe('pastis-app-layout', () => {
  let container;
  const host = () => container.querySelector('pastis-app-layout');
  const part = (name) => host().shadowRoot.querySelector(`[part="${name}"]`);
  const separator = () => host().shadowRoot.querySelector('[role="separator"]');

  afterEach(async () => {
    container?.remove();
    container = undefined;
    await page.viewport(1280, 800);
  });
  afterAll(() => page.viewport(initial.width, initial.height));

  describe('wide (at or above the breakpoint)', () => {
    it('renders sidebar, main and detail as nav, main and complementary landmarks', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open'));
      expect(host().mode).toBe('wide');
      expect(host().getAttribute('mode')).toBe('wide');
      await expect.element(page.getByRole('navigation', { name: 'Sidebar' })).toBeInTheDocument();
      await expect.element(page.getByRole('main')).toBeInTheDocument();
      await expect.element(page.getByRole('complementary', { name: 'Details' })).toBeInTheDocument();
      await expect.element(page.getByRole('heading', { name: 'Buy oat milk' })).toBeVisible();
      await expect.element(page.getByRole('link', { name: 'Today' })).toBeVisible();
    });

    it('labels are settable', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open sidebar-label="Views and lists" detail-label="Item" splitter-label="Resize the item pane"'));
      await expect.element(page.getByRole('navigation', { name: 'Views and lists' })).toBeInTheDocument();
      await expect.element(page.getByRole('complementary', { name: 'Item' })).toBeInTheDocument();
      await expect.element(page.getByRole('separator', { name: 'Resize the item pane' })).toBeInTheDocument();
    });

    it('lays out 260 px sidebar · main · detail at its width, the full viewport height', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="420"'));
      const nav = part('sidebar').getBoundingClientRect();
      const main = part('main').getBoundingClientRect();
      const aside = part('detail').getBoundingClientRect();
      expect(nav.width).toBe(260);
      expect(aside.width).toBe(420);
      expect(main.left).toBe(nav.right);
      expect(main.right).toBe(aside.left);
      expect(main.width).toBe(window.innerWidth - 260 - 420);
      for (const box of [nav, main, aside]) expect(box.height).toBe(window.innerHeight);
    });

    it('--pastis-app-layout-sidebar-width sets the sidebar width', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('style="--pastis-app-layout-sidebar-width: 300px"'));
      expect(part('sidebar').getBoundingClientRect().width).toBe(300);
    });

    it('sidebar-collapsed removes the sidebar; the main pane takes its place', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('sidebar-collapsed detail-open'));
      expect(part('sidebar')).toBeNull();
      expect(container.querySelector('[slot="sidebar"]').assignedSlot).toBeNull();
      await expect.element(page.getByRole('navigation')).not.toBeInTheDocument();
      expect(part('main').getBoundingClientRect().left).toBe(host().getBoundingClientRect().left);
      host().sidebarCollapsed = false;
      await settle();
      expect(host().hasAttribute('sidebar-collapsed')).toBe(false);
      await expect.element(page.getByRole('navigation', { name: 'Sidebar' })).toBeInTheDocument();
    });

    it('without detail-open there is no detail pane or splitter; the main pane takes the width', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout());
      expect(host().detailOpen).toBe(false);
      expect(part('detail')).toBeNull();
      expect(separator()).toBeNull();
      expect(container.querySelector('[slot="detail"]').assignedSlot).toBeNull();
      expect(part('main').getBoundingClientRect().right).toBe(host().getBoundingClientRect().right);
      host().detailOpen = true;
      await settle();
      expect(host().hasAttribute('detail-open')).toBe(true);
      await expect.element(page.getByRole('complementary')).toBeInTheDocument();
    });

    it('each pane scrolls on its own', async () => {
      await page.viewport(1280, 800);
      const long = Array.from({ length: 80 }, (_, i) => `<p>Item ${i + 1}</p>`).join('');
      container = await mount(layout('detail-open', `<h1>All</h1>${long}`));
      const main = part('main');
      expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
      expect(getComputedStyle(main).overflowY).toBe('auto');
      expect(getComputedStyle(part('sidebar')).overflowY).toBe('auto');
      expect(getComputedStyle(host().shadowRoot.querySelector('.detail')).overflowY).toBe('auto');
      main.scrollTop = 200;
      expect(main.scrollTop).toBe(200);
      expect(document.scrollingElement.scrollTop).toBe(0);
      expect(part('sidebar').getBoundingClientRect().top).toBe(0);
    });

    it('--pastis-app-layout-height sets its height', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open style="--pastis-app-layout-height: 480px"'));
      expect(host().getBoundingClientRect().height).toBe(480);
      expect(part('main').getBoundingClientRect().height).toBe(480);
    });
  });

  describe('narrow (below the breakpoint)', () => {
    it('renders only the main slot, in a main landmark and the page scroll', async () => {
      await page.viewport(800, 800);
      container = await mount(layout('detail-open'));
      expect(host().mode).toBe('narrow');
      expect(host().getAttribute('mode')).toBe('narrow');
      expect(part('sidebar')).toBeNull();
      expect(part('detail')).toBeNull();
      expect(container.querySelector('[slot="sidebar"]').assignedSlot).toBeNull();
      expect(container.querySelector('[slot="detail"]').assignedSlot).toBeNull();
      await expect.element(page.getByRole('main')).toBeInTheDocument();
      await expect.element(page.getByRole('heading', { name: 'Today' })).toBeVisible();
      await expect.element(page.getByRole('heading', { name: 'Buy oat milk' })).not.toBeInTheDocument();
      expect(getComputedStyle(part('main')).overflowY).toBe('visible');
      expect(getComputedStyle(host()).height).not.toBe(`${window.innerHeight}px`);
    });

    it('breakpoint moves the switch', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('breakpoint="1400"'));
      expect(host().mode).toBe('narrow');
      host().breakpoint = 1200;
      await settle();
      expect(host().mode).toBe('wide');
    });
  });

  describe('mode changes', () => {
    it('fires pastis-layout-change { mode } when the window crosses the breakpoint, not on connect', async () => {
      await page.viewport(1280, 800);
      const events = [];
      document.addEventListener('pastis-layout-change', e => events.push(e), { once: false });
      container = await mount(layout('detail-open'));
      expect(events).toHaveLength(0);
      await page.viewport(1000, 800);
      await settle();
      expect(host().mode).toBe('narrow');
      await page.viewport(1024, 800);
      await settle();
      expect(host().mode).toBe('wide');
      expect(events.map(e => e.detail)).toEqual([{ mode: 'narrow' }, { mode: 'wide' }]);
      expect(events[0].bubbles && events[0].composed).toBe(true);
      await expect.element(page.getByRole('complementary')).toBeInTheDocument();
    });

    it('stops listening once disconnected', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout());
      const el = host();
      const events = [];
      el.addEventListener('pastis-layout-change', e => events.push(e));
      el.remove();
      await page.viewport(800, 800);
      await settle();
      expect(events).toHaveLength(0);
      expect(el.mode).toBe('wide');
    });
  });

  describe('splitter', () => {
    const resizes = [];
    const listen = () => {
      resizes.length = 0;
      host().addEventListener('pastis-resize', e => resizes.push(e));
    };
    const width = () => part('detail').getBoundingClientRect().width;

    it('is a focusable vertical separator with the width as its value', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="420"'));
      const sep = page.getByRole('separator', { name: 'Resize details' });
      await expect.element(sep).toHaveAttribute('aria-orientation', 'vertical');
      await expect.element(sep).toHaveAttribute('aria-valuenow', '420');
      await expect.element(sep).toHaveAttribute('aria-valuemin', '380');
      await expect.element(sep).toHaveAttribute('aria-valuemax', String(Math.floor(window.innerWidth * 0.6)));
      await expect.element(sep).toHaveAttribute('aria-controls', 'detail');
      expect(separator().tabIndex).toBe(0);
      // On the detail pane's leading edge (over its border), as tall as the pane
      const box = separator().getBoundingClientRect();
      expect(box.left).toBe(part('detail').getBoundingClientRect().left);
      expect(box.width).toBe(8);
      expect(box.height).toBe(part('detail').getBoundingClientRect().height);
    });

    it('the width is kept between 380 px and 60 % of the layout', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="100"'));
      expect(width()).toBe(380);
      expect(separator().getAttribute('aria-valuenow')).toBe('380');
      host().detailWidth = 5000;
      await settle();
      expect(width()).toBe(Math.floor(window.innerWidth * 0.6));
    });

    it('Left/Right resize by 16 px, with Shift by 64 px; Home and End go to the limits', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="420"'));
      listen();
      separator().focus();
      await userEvent.keyboard('{ArrowLeft}');
      await settle();
      expect(width()).toBe(436);
      expect(host().detailWidth).toBe(436);
      await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      await settle();
      expect(width()).toBe(500);
      await userEvent.keyboard('{ArrowRight}');
      await settle();
      expect(width()).toBe(484);
      expect(separator().getAttribute('aria-valuenow')).toBe('484');
      await userEvent.keyboard('{Home}');
      await settle();
      expect(width()).toBe(380);
      // Already at the narrowest: nothing changes, nothing fires
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.keyboard('{End}');
      await settle();
      const max = Math.floor(window.innerWidth * 0.6);
      expect(width()).toBe(max);
      expect(resizes.map(e => e.detail.width)).toEqual([436, 500, 484, 380, max]);
      expect(resizes[0].bubbles && resizes[0].composed).toBe(true);
    });

    it('focus on the splitter is visible', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open'));
      separator().focus();
      await userEvent.keyboard('{ArrowLeft}');
      await new Promise(resolve => setTimeout(resolve, 250));
      const line = getComputedStyle(separator(), '::before');
      expect(line.backgroundColor).toBe('rgb(252, 186, 40)');
      expect(parseFloat(line.width)).toBeGreaterThanOrEqual(2);
    });

    it('dragging resizes live and reports the width once, at the end', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="420"'));
      listen();
      const sep = separator();
      const x = sep.getBoundingClientRect().left + 4;
      const pointer = (type, clientX) => sep.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, clientX, clientY: 300, button: 0, pointerId: 1 }));
      pointer('pointerdown', x);
      expect(host().hasAttribute('data-dragging')).toBe(true);
      pointer('pointermove', x - 60);
      await settle();
      expect(width()).toBe(480);
      pointer('pointermove', x - 100);
      await settle();
      expect(width()).toBe(520);
      expect(resizes).toHaveLength(0);
      pointer('pointerup', x - 100);
      await settle();
      expect(host().hasAttribute('data-dragging')).toBe(false);
      expect(resizes.map(e => e.detail)).toEqual([{ width: 520 }]);
      // Dragging past the limit stops at it
      pointer('pointerdown', x - 100);
      pointer('pointermove', x + 400);
      pointer('pointerup', x + 400);
      await settle();
      expect(width()).toBe(380);
      expect(resizes.at(-1).detail).toEqual({ width: 380 });
    });

    it('a double click switches between the widest and the narrowest (no drag needed)', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open detail-width="420"'));
      listen();
      const max = Math.floor(window.innerWidth * 0.6);
      await userEvent.dblClick(page.getByRole('separator'));
      await settle();
      expect(width()).toBe(max);
      await userEvent.dblClick(page.getByRole('separator'));
      await settle();
      expect(width()).toBe(380);
      expect(resizes.map(e => e.detail.width)).toEqual([max, 380]);
    });

    it('a click without movement reports nothing', async () => {
      await page.viewport(1280, 800);
      container = await mount(layout('detail-open'));
      listen();
      await userEvent.click(page.getByRole('separator'));
      expect(resizes).toHaveLength(0);
    });
  });

  it('has no axe violations, every pane open, in both themes', async () => {
    await page.viewport(1280, 800);
    for (const theme of ['dark', 'light']) {
      container = await mount(`<div data-theme="${theme}" style="background:var(--bg-primary);color:var(--text-primary)">${layout('detail-open')}</div>`);
      expect((await axe.run(container, AXE)).violations.map(v => v.id), theme).toEqual([]);
      container.remove();
    }
  });

  it('has no axe violations narrow', async () => {
    await page.viewport(800, 800);
    container = await mount(`<div style="background:var(--bg-primary);color:var(--text-primary)">${layout('detail-open')}</div>`);
    expect((await axe.run(container, AXE)).violations.map(v => v.id)).toEqual([]);
  });
});
