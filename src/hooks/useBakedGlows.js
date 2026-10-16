import { useEffect } from 'react';

/**
 * Pre-renders each ambient `.glow` blob (radial gradient, border-radius:50%, filter: blur(70px))
 * into a canvas once, then drops the live CSS filter. A CSS blur is re-run by the GPU on every
 * frame the glow is on screen — and the glows float continuously and parallax on scroll, so
 * that's every frame. A baked bitmap is just composited.
 *
 * The bake reproduces the CSS exactly: same gradient (sized to the farthest corner), same
 * elliptical clip, same Gaussian blur. It renders at 1/4 resolution and is scaled back up —
 * a 70px blur has no detail finer than that. The element keeps its own opacity/transform, so
 * parallax and the idle float are unaffected.
 *
 * Any element whose computed style doesn't match that shape (e.g. `.tg-step.glow`, which is a
 * chart bar) is left alone, as are browsers without canvas `filter` support — they keep the
 * CSS blur.
 */
const SCALE = 0.25;
const BLUR = /^blur\(([\d.]+)px\)$/;
const GRADIENT = /^radial-gradient\(circle, rgba?\(([^)]*)\), rgba\(0, 0, 0, 0\) ([\d.]+)%\)$/;

function bake(el) {
  const cs = getComputedStyle(el);
  const blur = BLUR.exec(cs.filter);
  const grad = GRADIENT.exec(cs.backgroundImage);
  const W = el.offsetWidth;
  const H = el.offsetHeight;
  if (!blur || !grad || !W || !H || cs.borderTopLeftRadius !== '50%' || cs.position === 'static') return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx || typeof ctx.filter !== 'string') return null;

  const sigma = parseFloat(blur[1]);
  const [r, g, b, a = '1'] = grad[1].split(',').map((s) => s.trim());
  const stop = parseFloat(grad[2]) / 100;
  // Pad by 3σ (where a Gaussian has fallen to ~0) so the blur's spread isn't cut off. The
  // bitmap is a whole number of pixels, so derive the CSS box from it to keep scale exact.
  const pad = Math.ceil(sigma * 3);
  const cw = Math.round((W + 2 * pad) * SCALE);
  const ch = Math.round((H + 2 * pad) * SCALE);
  canvas.width = cw;
  canvas.height = ch;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    left: `${(W - cw / SCALE) / 2}px`,
    top: `${(H - ch / SCALE) / 2}px`,
    width: `${cw / SCALE}px`,
    height: `${ch / SCALE}px`,
    display: 'block',
    pointerEvents: 'none',
  });

  const cx = cw / 2;
  const cy = ch / 2;
  const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W / 2, H / 2) * SCALE);
  fill.addColorStop(0, `rgba(${r},${g},${b},${a})`);
  fill.addColorStop(stop, `rgba(${r},${g},${b},0)`);
  ctx.filter = `blur(${sigma * SCALE}px)`;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(cx, cy, (W / 2) * SCALE, (H / 2) * SCALE, 0, 0, Math.PI * 2);
  ctx.fill();

  el.appendChild(canvas);
  el.style.filter = 'none';
  el.style.backgroundImage = 'none';
  return () => {
    canvas.remove();
    el.style.removeProperty('filter');
    el.style.removeProperty('background-image');
  };
}

export default function useBakedGlows() {
  useEffect(() => {
    const undo = [].slice.call(document.querySelectorAll('.glow')).map(bake).filter(Boolean);
    return () => undo.forEach((fn) => fn());
  }, []);
}
