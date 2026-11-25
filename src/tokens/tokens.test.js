import { describe, it, expect, afterEach } from 'vitest';
import './colors.css';

/** Relative luminance of an `rgb(r, g, b)` colour (WCAG 2). */
function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const BACKGROUNDS = ['--bg-primary', '--bg-secondary', '--bg-card', '--bg-elevated', '--bg-overlay'];

describe('colour tokens', () => {
  let el;
  afterEach(() => el?.remove());

  /** Each token resolved to a computed colour in the given theme. */
  function resolve(theme, tokens) {
    el = document.createElement('div');
    el.dataset.theme = theme;
    el.innerHTML = tokens.map(t => `<span style="color: var(${t})"></span>`).join('');
    document.body.appendChild(el);
    return Object.fromEntries(tokens.map((t, i) => [t, getComputedStyle(el.children[i]).color]));
  }

  it.each(['dark', 'light'])('--text-error is at least 4.5:1 on every background (%s)', (theme) => {
    const colours = resolve(theme, ['--text-error', ...BACKGROUNDS]);
    for (const bg of BACKGROUNDS) {
      expect(ratio(colours['--text-error'], colours[bg]), bg).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(['dark', 'light'])('--border-focus is at least 3:1 on every background (%s)', (theme) => {
    const colours = resolve(theme, ['--border-focus', ...BACKGROUNDS]);
    for (const bg of BACKGROUNDS) {
      expect(ratio(colours['--border-focus'], colours[bg]), bg).toBeGreaterThanOrEqual(3);
    }
  });
});
