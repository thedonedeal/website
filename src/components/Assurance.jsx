import React from 'react';

export default function Assurance() {
  return (
    <section className="assurance on-light" id="fees" data-screen-label="Confidentiality & fees">
      <div className="amb">
        <div className="glow p" style={{ width: '520px', height: '430px', left: '6%', top: '12%', opacity: 0.16 }} />
        <div className="glow warm" style={{ width: '460px', height: '400px', right: '4%', bottom: '4%', opacity: 0.22 }} />
        <div className="bigicon drift" data-speed="0.07" style={{ width: '420px', height: '420px', right: '-80px', top: '30px' }}>
          <svg viewBox="0 0 24 24"><use href="#ic-lock" /></svg>
        </div>
      </div>
      <div className="wrap">
        <div className="eyebrow-row reveal">
          <span className="num">05</span>
          <span className="kicker">Confidentiality & fees</span>
          <span className="ln" />
        </div>
        <h2 className="h-sec reveal">Quiet process. <span className="accent-copper">Honest fees.</span></h2>
        <div className="stack">
          <div className="stack-card sc-1">
            <span className="sc-tag">01 — 02</span>
            <div className="sc-head">
              <span className="sc-ic"><svg viewBox="0 0 24 24"><use href="#ic-lock" /></svg></span>
              <div className="sc-kick">Confidentiality</div>
              <h3>Nobody finds out until you decide.</h3>
              <p className="sc-sub">Anonymous by default — your name enters the room only after your sign-off, on every single introduction.</p>
            </div>
            <ul className="sc-list">
              <li>
                <svg className="ic" viewBox="0 0 24 24"><use href="#ic-shield" /></svg>
                <span><b>Stealth profiles by default.</b> Buyers see an anonymous, range-only profile — never your name.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24"><use href="#ic-eye" /></svg>
                <span><b>You approve every introduction.</b> No identity is revealed without your say-so on each name.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24"><use href="#ic-layers" /></svg>
                <span><b>Ranges, not raw numbers.</b> Sensitive financials stay banded until a buyer is under NDA.</span>
              </li>
              <li>
                <svg className="ic" viewBox="0 0 24 24"><use href="#ic-lock" /></svg>
                <span><b>Your data is never sold.</b> Encrypted in transit and at rest. An intermediary, not a broker.</span>
              </li>
            </ul>
          </div>
          <div className="stack-card sc-2">
            <span className="sc-tag">02 — 02</span>
            <div className="sc-head">
              <span className="sc-ic"><svg viewBox="0 0 24 24"><use href="#ic-scale" /></svg></span>
              <div className="sc-kick">Fee transparency</div>
              <h3>No retainer. We win when you do.</h3>
              <p className="sc-sub">A direct attack on the opaque, retainer-heavy legacy model — you see the whole fee before you sign a thing.</p>
            </div>
            <div>
              <div className="sc-fees">
                <div className="sc-fee"><div className="v">₹0</div><div className="k">Retainer. Ever.</div></div>
                <div className="sc-fee"><div className="v"><span className="pct">3–5%</span></div><div className="k">Tiered success fee, agreed up front</div></div>
                <div className="sc-fee"><div className="v">1</div><div className="k">Page engagement letter — no fine print</div></div>
              </div>
              <p className="sc-foot">If we don't close, you don't pay. That's the whole model.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
