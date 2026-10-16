/**
 * One scroll listener and one requestAnimationFrame callback shared by every
 * scroll-linked effect. Each subscriber splits its work into a `read` phase
 * (getBoundingClientRect, offsetHeight, scrollY…) and a `write` phase (style,
 * class and text writes). Every read runs before any write, so a scroll frame
 * costs one layout. With a separate rAF per effect, each effect's reads land
 * after the previous effect's writes and force a fresh synchronous layout.
 */
const subscribers = new Set();
let queued = false;

function flush() {
  queued = false;
  const list = Array.from(subscribers);
  const data = list.map((s) => (s.read ? s.read() : undefined));
  for (let i = 0; i < list.length; i++) {
    // A write may unsubscribe a later subscriber (e.g. a one-shot reveal); skip it.
    if (list[i].write && subscribers.has(list[i])) list[i].write(data[i]);
  }
}

/** Run every subscriber on the next frame. Window scrolls call this automatically. */
export function requestScrollFrame() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(flush);
  }
}

/**
 * @param {{ read?: () => any, write?: (data: any) => void }} sub
 *   `write` receives whatever `read` returned in the same frame.
 * @returns {() => void} unsubscribe
 */
export function onScrollFrame(sub) {
  if (!subscribers.size) window.addEventListener('scroll', requestScrollFrame, { passive: true });
  subscribers.add(sub);
  return () => {
    subscribers.delete(sub);
    if (!subscribers.size) window.removeEventListener('scroll', requestScrollFrame);
  };
}
