import { svg } from 'lit';

/**
 * The Pastis icon set: Pastis name → SVG content for a 24 × 24 viewBox, drawn with
 * `stroke="currentColor"` by `<pastis-icon>`.
 *
 * Copied from Lucide (https://lucide.dev), lucide-static v1.71.0, ISC licence (see
 * LICENSE-lucide next to this file). The comment on each entry is its Lucide name. Add icons by
 * copying their elements from the same Lucide version, with no fills other than `currentColor`.
 */
export const icons = {
  // sun
  today: svg`<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />`,
  // calendar
  calendar: svg`<path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />`,
  // list
  list: svg`<path d="M3 5h.01" /><path d="M3 12h.01" /><path d="M3 19h.01" /><path d="M8 5h13" /><path d="M8 12h13" /><path d="M8 19h13" />`,
  // search
  search: svg`<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />`,
  // flag
  flag: svg`<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />`,
  // repeat
  repeat: svg`<path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />`,
  // clock
  clock: svg`<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />`,
  // tag
  tag: svg`<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />`,
  // list-tree
  subtasks: svg`<path d="M8 5h13" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="M3 10a2 2 0 0 0 2 2h3" /><path d="M3 5v12a2 2 0 0 0 2 2h3" />`,
  // circle-alert
  alert: svg`<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />`,
  // plus
  plus: svg`<path d="M5 12h14" /><path d="M12 5v14" />`,
  // check
  check: svg`<path d="M20 6 9 17l-5-5" />`,
  // x
  close: svg`<path d="M18 6 6 18" /><path d="m6 6 12 12" />`,
  // ellipsis
  more: svg`<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />`,
  // pencil
  edit: svg`<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />`,
  // trash-2
  trash: svg`<path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />`,
  // chevron-right
  'chevron-right': svg`<path d="m9 18 6-6-6-6" />`,
  // chevron-left
  'chevron-left': svg`<path d="m15 18-6-6 6-6" />`,
  // inbox
  inbox: svg`<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />`,
  // undo-2
  'trash-restore': svg`<path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />`,
};

/** Every icon name, in set order. */
export const iconNames = Object.keys(icons);
