import { useEffect } from 'react';
import { onScrollFrame } from '../lib/scrollFrame';

/**
 * Light parallax on imagery (.parallax, scaled) and ambient drifting shapes
 * (.drift, .amb .glow / .halfcircle / .bigicon / .spill). Restrained, never flashy.
 */
export default function useParallax() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parallax = [].slice.call(document.querySelectorAll('.parallax'));
    let drifters = [].slice.call(document.querySelectorAll('.drift, .amb .glow, .amb .halfcircle, .amb .bigicon, .amb .spill'));
    drifters = drifters.filter((el, i) => drifters.indexOf(el) === i);
    if (reduce || (!parallax.length && !drifters.length)) return;

    drifters.forEach((el) => { const t = el.style.transform; if (t) el.setAttribute('data-base', t); });
    // Speeds and base transforms are fixed at mount; read them once, not every frame.
    const pSpeed = parallax.map((el) => parseFloat(el.getAttribute('data-speed')) || 0.06);
    const dSpeed = drifters.map((el) => parseFloat(el.getAttribute('data-speed')) || 0.1);
    const dBase = drifters.map((el) => el.getAttribute('data-base') || '');

    const read = () => ({
      vh: window.innerHeight,
      p: parallax.map((el) => el.getBoundingClientRect()),
      d: drifters.map((el) => el.getBoundingClientRect()),
    });
    const write = ({ vh, p, d }) => {
      parallax.forEach((el, i) => {
        const off = ((p[i].top + p[i].height / 2) - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (off * pSpeed[i] * 100).toFixed(2) + 'px,0) scale(1.06)';
      });
      drifters.forEach((el, i) => {
        const off = ((d[i].top + d[i].height / 2) - vh / 2) / vh;
        el.style.transform = dBase[i] + ' translate3d(0,' + (off * dSpeed[i] * -340).toFixed(2) + 'px,0)';
      });
    };
    const applyParallax = () => write(read());
    const unsubscribe = onScrollFrame({ read, write });
    window.addEventListener('resize', applyParallax);
    applyParallax();

    return () => { unsubscribe(); window.removeEventListener('resize', applyParallax); };
  }, []);
}
