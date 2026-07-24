import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Resolve the utm_source to forward when sending visitors into the app.
//
// Prefer a utm_source that is already on the browser URL (e.g. the visitor
// arrived from LinkedIn with ?utm_source=linked) and keep it end-to-end.
// Otherwise fall back to the current page slug ('home', 'investors', …).
//
// The read happens inside an effect (client-only, after hydration) because
// pages are prerendered with StaticRouter and no query string — so the
// build-time HTML bakes the page-slug fallback into every link. Reading from
// window.location in the effect updates state and overwrites that stale value
// with the real incoming utm_source on the client.
export default function useUtmSource(fallback) {
  const { pathname } = useLocation();
  const pageSlug =
    fallback || pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'home';
  const [utmSource, setUtmSource] = useState(pageSlug);

  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search).get('utm_source');
    setUtmSource(incoming || pageSlug);
  }, [pageSlug]);

  return utmSource;
}
