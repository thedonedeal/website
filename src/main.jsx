import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './lib/imageSlot.js'; // registers the <image-slot> web component
import './index.css';
import App from './App.jsx';

const root = document.getElementById('root');
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Prerendered routes ship with content already in #root — hydrate those.
// The dev server (`npm run dev`) serves an empty #root, so fall back to a
// plain client render there.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
