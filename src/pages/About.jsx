import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import About from '../components/About';
import Seo from '../components/Seo';
import { ROUTE_META } from '../seo/meta';

export default function AboutPage() {
  return (
    <>
      <Seo {...ROUTE_META['/about']} path="/about" />
      <Nav current="about" />
      <main id="top">
        <About />
      </main>
      <Footer />
    </>
  );
}
