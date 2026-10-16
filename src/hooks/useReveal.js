import { useEffect } from 'react';
import { trackEvent } from '../helper/posthogHelper';
import { POSTHOG_EVENTS } from '../constants/posthogEvents';
import { onScrollFrame } from '../lib/scrollFrame';

/**
 * Scroll-driven content behaviours shared across pages:
 *  • refined fade + rise reveals (IntersectionObserver, gentle stagger)
 *  • top scroll-progress bar
 *  • FAQ accordions
 *  • count-up stats (.tn[data-count])
 *  • live-deals marquee clone
 *  • testimonial carousel
 * Every block guards on element presence, so it is safe on any page.
 */
export default function useReveal() {
  useEffect(() => {
    const cleanups = [];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── reveals ── */
    const reveals = [].slice.call(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach((el, i) => { el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms'; io.observe(el); });
      const sweep = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        reveals.forEach((el) => {
          if (el.classList.contains('in')) return;
          if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in');
        });
      };
      window.addEventListener('load', sweep);
      const t = setTimeout(sweep, 400);
      cleanups.push(() => { io.disconnect(); window.removeEventListener('load', sweep); clearTimeout(t); });
    } else {
      reveals.forEach((el) => el.classList.add('in'));
    }

    /* ── scroll progress bar ── */
    const bar = document.getElementById('scroll-progress-bar');
    if (bar) {
      const read = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      };
      // scaleX, not width: a width change re-runs layout on every scroll frame.
      const write = (p) => { bar.style.transform = 'scaleX(' + p.toFixed(4) + ')'; };
      const update = () => write(read());
      const unsubscribe = onScrollFrame({ read, write });
      window.addEventListener('resize', update);
      window.addEventListener('load', update);
      update();
      cleanups.push(() => { unsubscribe(); window.removeEventListener('resize', update); window.removeEventListener('load', update); });
    }

    /* ── FAQ accordions ── */
    const faqItems = [].slice.call(document.querySelectorAll('.faq-item'));
    const faqHandlers = [];
    faqItems.forEach((item) => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      if (!q || !a) return;
      const h = () => {
        if (item.classList.contains('open')) { a.style.maxHeight = '0px'; item.classList.remove('open'); }
        else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      };
      q.addEventListener('click', h);
      faqHandlers.push([q, h]);
    });
    const onResizeFaq = () => {
      [].slice.call(document.querySelectorAll('.faq-item.open .faq-a')).forEach((a) => { a.style.maxHeight = a.scrollHeight + 'px'; });
    };
    window.addEventListener('resize', onResizeFaq);
    cleanups.push(() => { faqHandlers.forEach(([q, h]) => q.removeEventListener('click', h)); window.removeEventListener('resize', onResizeFaq); });

    /* ── count-up stats ── */
    const grid = document.querySelector('.track-grid2');
    if (grid) {
      const els = [].slice.call(grid.querySelectorAll('.tn[data-count]'));
      if (els.length) {
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        els.forEach((el) => {
          const u = el.querySelector('.u');
          el._unit = u ? u.outerHTML : '';
          el._prefix = el.getAttribute('data-prefix') || '';
          el._target = parseFloat(el.getAttribute('data-count')) || 0;
          el._dec = parseInt(el.getAttribute('data-decimals'), 10) || 0;
          el._comma = el.getAttribute('data-comma') === '1';
        });
        const render = (el, p) => {
          const v = el._target * p;
          let num = el._dec ? v.toFixed(el._dec) : String(Math.round(v));
          if (el._comma) num = Number(num).toLocaleString('en-IN');
          el.innerHTML = el._prefix + num + el._unit;
        };
        els.forEach((el) => render(el, reduce ? 1 : 0));
        if (!reduce) {
          let done = false;
          let unsubscribe = () => {};
          const run = () => {
            if (done) return; done = true;
            unsubscribe();
            const dur = 1600; let start = null;
            const step = (ts) => {
              if (start === null) start = ts;
              const p = Math.min(1, (ts - start) / dur), e = ease(p);
              els.forEach((el) => render(el, e));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          };
          const inView = () => {
            const r = grid.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            return r.top < vh * 0.85 && r.bottom > 0;
          };
          unsubscribe = onScrollFrame({ read: inView, write: (seen) => { if (seen) run(); } });
          if (inView()) run();
          cleanups.push(() => unsubscribe());
        }
      }
    }

    /* ── live-deals marquee: clone track for a seamless loop ── */
    const mtrack = document.getElementById('marquee-track');
    if (mtrack && mtrack.dataset.cloned !== '1') {
      mtrack.innerHTML = mtrack.innerHTML + mtrack.innerHTML;
      mtrack.dataset.cloned = '1';
    }

    /* ── testimonial carousel ── */
    const carousel = document.getElementById('testi-carousel');
    const ttrack = document.getElementById('testi-track');
    const dots = [].slice.call(document.querySelectorAll('#testi-dots .td'));
    if (carousel && ttrack && dots.length) {
      const slides = [].slice.call(ttrack.children);
      const n = slides.length;
      const DWELL = 6000;
      let idx = 0, paused = false, elapsed = 0, lastTs = 0, rafId = null, alive = true, visible = true;
      const fillOf = (i) => dots[i].querySelector('i');
      // Slide the fill in with a transform rather than growing its width, so the
      // per-frame timer update never triggers layout.
      const setFill = (i, frac) => { fillOf(i).style.transform = 'translateX(' + ((frac - 1) * 100).toFixed(2) + '%)'; };
      const show = (i) => {
        idx = ((i % n) + n) % n;
        ttrack.style.transform = 'translate3d(' + (-idx * 100) + '%,0,0)';
        dots.forEach((d, k) => { d.classList.toggle('done', k < idx); if (k !== idx) setFill(k, k < idx ? 1 : 0); });
        setFill(idx, 0);
      };
      const goTo = (i) => { elapsed = 0; lastTs = 0; show(i); };
      const loop = (ts) => {
        if (!alive) return;
        // Off screen: stop the loop (and the dwell timer) until the carousel is back.
        if (!visible) { rafId = null; lastTs = 0; return; }
        if (!lastTs) lastTs = ts;
        const dt = ts - lastTs; lastTs = ts;
        if (!paused) {
          elapsed += dt;
          const frac = Math.min(1, elapsed / DWELL);
          setFill(idx, frac);
          if (frac >= 1) { elapsed = 0; show(idx + 1); }
        }
        rafId = requestAnimationFrame(loop);
      };
      const dotHandlers = dots.map((d) => { const h = () => goTo(parseInt(d.getAttribute('data-i'), 10)); d.addEventListener('click', h); return [d, h]; });
      const prev = document.getElementById('testi-prev');
      const next = document.getElementById('testi-next');
      const onPrev = () => goTo(idx - 1), onNext = () => goTo(idx + 1);
      if (prev) prev.addEventListener('click', onPrev);
      if (next) next.addEventListener('click', onNext);
      const onEnter = () => { paused = true; }, onLeave = () => { paused = false; lastTs = 0; };
      carousel.addEventListener('pointerenter', onEnter);
      carousel.addEventListener('pointerleave', onLeave);
      show(0);
      if (!reduce) rafId = requestAnimationFrame(loop);
      let tio = null;
      if (!reduce && 'IntersectionObserver' in window) {
        tio = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (visible && rafId === null && alive) rafId = requestAnimationFrame(loop);
        }, { threshold: 0 });
        tio.observe(carousel);
      }
      cleanups.push(() => {
        alive = false; if (rafId) cancelAnimationFrame(rafId);
        if (tio) tio.disconnect();
        dotHandlers.forEach(([d, h]) => d.removeEventListener('click', h));
        if (prev) prev.removeEventListener('click', onPrev);
        if (next) next.removeEventListener('click', onNext);
        carousel.removeEventListener('pointerenter', onEnter);
        carousel.removeEventListener('pointerleave', onLeave);
      });
    }

    /* ── deals accordion (Stripe-style, autoplaying) ── */
    const acc = document.getElementById('acc');
    if (acc) {
      const panels = [].slice.call(acc.querySelectorAll('.acc-panel'));
      const capText = document.getElementById('acc-cap-text');
      const capLink = document.getElementById('acc-cap-link');
      let idx = 0, timer = null, paused = false;
      const DELAY = 3600;
      const show = (i) => {
        idx = ((i % panels.length) + panels.length) % panels.length;
        panels.forEach((p, k) => p.classList.toggle('on', k === idx));
        if (capText) {
          capText.style.opacity = '0';
          setTimeout(() => {
            const p = panels[idx];
            capText.innerHTML = '<b>' + p.getAttribute('data-name') + '.</b> ' + p.getAttribute('data-desc') +
              ' <span style="color:var(--bone-faint)">· ' + p.getAttribute('data-tag') + '</span>';
            capText.style.opacity = '1';
          }, 200);
        }
        if (capLink) {
          const slug = panels[idx].getAttribute('data-slug');
          if (slug) {
            capLink.href = '/blog/' + slug;
            capLink.style.visibility = 'visible';
          } else {
            capLink.removeAttribute('href');
            capLink.style.visibility = 'hidden';
          }
        }
      };
      const tick = () => { if (!paused) show(idx + 1); };
      const startAuto = () => { stopAuto(); timer = setInterval(tick, DELAY); };
      const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };
      const panelHandlers = panels.map((p, k) => { const h = () => { if (k !== idx) { show(k); startAuto(); } }; p.addEventListener('click', h); return [p, h]; });
      const prev = document.getElementById('acc-prev');
      const next = document.getElementById('acc-next');
      const onPrev = () => { show(idx - 1); startAuto(); };
      const onNext = () => { show(idx + 1); startAuto(); };
      if (prev) prev.addEventListener('click', onPrev);
      if (next) next.addEventListener('click', onNext);
      const onEnter = () => { paused = true; };
      const onLeave = () => { paused = false; };
      acc.addEventListener('mouseenter', onEnter);
      acc.addEventListener('mouseleave', onLeave);
      const onCapLinkClick = () => {
        const p = panels[idx];
        trackEvent(POSTHOG_EVENTS.HOMEPAGE.WEBSITE_LP_READ_STORY_CLICKED, {
          deal: p ? p.getAttribute('data-slug') : undefined,
        });
      };
      if (capLink) capLink.addEventListener('click', onCapLinkClick);
      show(0);
      let io2 = null;
      if ('IntersectionObserver' in window) {
        io2 = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) startAuto(); else stopAuto(); }), { threshold: 0.25 });
        io2.observe(acc);
      } else { startAuto(); }
      cleanups.push(() => {
        stopAuto();
        panelHandlers.forEach(([p, h]) => p.removeEventListener('click', h));
        if (prev) prev.removeEventListener('click', onPrev);
        if (next) next.removeEventListener('click', onNext);
        acc.removeEventListener('mouseenter', onEnter);
        acc.removeEventListener('mouseleave', onLeave);
        if (capLink) capLink.removeEventListener('click', onCapLinkClick);
        if (io2) io2.disconnect();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
