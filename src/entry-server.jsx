import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';

export { getAllRoutes } from './seo/meta';

// Used only by scripts/prerender.mjs (Node, build time) — never shipped to
// the browser. Effects (Lenis, IntersectionObserver, etc.) never run here
// since renderToString doesn't execute them, so App is safe to render as-is.
export function render(url) {
  const helmetContext = {};
  const html = renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
  return { html, helmet: helmetContext.helmet };
}
