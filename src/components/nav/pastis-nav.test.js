import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axe from 'axe-core';
import './pastis-nav.js';

describe('pastis-nav', () => {
  let el;

  beforeEach(async () => {
    el = document.createElement('pastis-nav');
    el.brand = 'Brand';
    el.items = [
      { id: 'work', label: 'Work', href: '/' },
      { id: 'about', label: 'About', href: '/about' },
    ];
    el.active = 'work';
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('renders a link per item', () => {
    const links = el.shadowRoot.querySelectorAll('.nav-links .nav-link');
    expect(links.length).toBe(2);
    expect(links[1].getAttribute('href')).toBe('/about');
  });

  it('passes axe-core', async () => {
    const results = await axe.run(el);
    expect(results.violations).toEqual([]);
  });
});
