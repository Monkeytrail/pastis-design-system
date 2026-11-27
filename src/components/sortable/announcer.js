/**
 * One polite live region for the whole page, in `document.body` (outside any list: a live region
 * inside a `role="list"` host would be one of its items). Used by `pastis-sortable` and
 * `pastis-kanban-board` to say what a move did.
 */
let region = null;

function liveRegion() {
  if (region?.isConnected) return region;
  region = document.createElement('div');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.dataset.pastisAnnouncer = '';
  // Visually hidden, still read (the usual clip pattern; outside any shadow root, so inline)
  Object.assign(region.style, {
    position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px',
    overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0',
  });
  document.body.append(region);
  return region;
}

/** Announces `text`; the same text twice in a row is announced twice. */
export function announce(text) {
  const live = liveRegion();
  live.textContent = '';
  // A change after the clearing, so screen readers see new content even when it is the same.
  setTimeout(() => { live.textContent = text; }, 50);
}

/** A child's name for announcements: `data-sortable-label`, `aria-label`, a task row's title, its text. */
export function itemName(child) {
  return (
    child.getAttribute('data-sortable-label') ||
    child.getAttribute('aria-label') ||
    child.taskTitle ||
    child.textContent.trim().replace(/\s+/g, ' ') ||
    'Item'
  );
}
