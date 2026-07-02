import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import About from '../components/About';

export default function AboutPage() {
  return (
    <>
      <Nav current="about" />
      <main id="top">
        <About />
      </main>
      <Footer />
    </>
  );
}
