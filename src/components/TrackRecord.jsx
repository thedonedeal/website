import React from 'react';

export default function TrackRecord() {
  return (
    <section className="track framed" data-screen-label="Track record">
      <div className="amb">
        <div className="halfcircle" data-speed="0.001" style={{ width: '320px', height: '320px', right: '-120px', top: '48px' }} />
        <div className="halfcircle warm" data-speed="0.001" style={{ width: '240px', height: '240px', left: '-90px', bottom: '48px' }} />
      </div>
      <div className="wrap">
        <h2 className="h-sec reveal">The numbers a bank is <span className="accent-i">judged on.</span></h2>
        <div className="track-grid2">
          <div className="tcard reveal">
            <div className="tg">
              <span className="tg-glow" style={{ left: '4px', bottom: 0, width: '46px', height: '104px', borderRadius: '15px' }} />
              <span className="tg-dim" style={{ left: '62px', bottom: 0, width: '46px', height: '38px', borderRadius: '13px' }} />
            </div>
            <div className="tn" data-count="30">35</div>
            <div className="tl">Mandates closed across raise &amp; exit</div>
          </div>
          <div className="tcard reveal">
            <div className="tg">
              <span className="tg-ring" style={{ left: '56px', width: '128px', height: '128px', bottom: '64px' }} />
              <span className="tg-ring" style={{ left: '56px', width: '90px', height: '90px', opacity: 0.65, bottom: '64px' }} />
              <span className="tg-coin" style={{ left: '56px', bottom: '64px' }} />
            </div>
            <div className="tn" data-count="400" data-prefix="₹" data-comma="1">
              ₹400<span className="u">&nbsp;Cr</span>
            </div>
            <div className="tl">Cumulative deal value transacted</div>
          </div>
          <div className="tcard reveal">
            <div className="tg">
              <span className="tg-pill on" style={{ left: '4px', bottom: '46px', width: '96px' }} />
              <span className="tg-pill" style={{ left: '4px', bottom: 0, width: '158px' }} />
            </div>
            <div className="tn" data-count="14">14<span className="u">&nbsp;wks</span></div>
            <div className="tl">Median time to close vs. 9-month industry norm</div>
          </div>
          <div className="tcard reveal">
            <div className="tg">
              <span className="tg-step" style={{ left: '4px', height: '38px' }} />
              <span className="tg-step mid" style={{ left: '62px', height: '66px', backgroundColor: 'rgb(93, 113, 255)' }} />
              <span className="tg-step glow" style={{ left: '120px', height: '100px' }} />
            </div>
            <div className="tn" data-count="1.9" data-decimals="1">1.9<span className="u">×</span></div>
            <div className="tl">Median valuation uplift on first offer</div>
          </div>
        </div>
      </div>
    </section>
  );
}
