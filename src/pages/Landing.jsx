import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection.tsx';
import '../styles/landing.css';

export default function Landing() {
  return (
    <div>
      <Nav />
      <HeroSection />
      <Utility />
      <Flow />
      <Guarantee />
      <CtaBand />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="nav">
      <div className="wrap">
        <div className="nav-mark">
          {/* <span className="dot" /> */}
          <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-cyan-400"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
          Next Universe
        </div>
        <nav className="nav-links">
          <a href="#utility">Utility</a>
          <a href="#flow">How it works</a>
          <a href="#contact">Contact</a>
        </nav>
        <Link to="/app" className="btn-ghost">Launch App</Link>
      </div>
    </header>
  );
}

function Utility() {
  return (
    <section className="section" id="utility">
      <div className="wrap utility-grid">
        <div className="utility-copy">
          <span className="section-tag">Real utility</span>
          <h2 style={{ marginBottom: 18 }}>An NFT with a claim behind it</h2>
          <p>
            Each plot maps to an actual segment of a real place. Minting it
            removes that segment from the map for good — no one else can ever
            buy it.
          </p>
          <div className="utility-list">
            <div className="utility-item">
              <span className="mark">✓</span>
              <div className="body">
                <strong>One owner, permanently</strong>
                <span>A minted segment is retired from the available map.</span>
              </div>
            </div>
            <div className="utility-item">
              <span className="mark">✓</span>
              <div className="body">
                <strong>Notified on what happens there</strong>
                <span>Events and news tied to your plot reach your wallet.</span>
              </div>
            </div>
            <div className="utility-item">
              <span className="mark">✓</span>
              <div className="body">
                <strong>Settled on BDX</strong>
                <span>Payment and minting run wallet to wallet on BDX.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="plot-card">
          <div className="plot-card-top">
            <span className="plot-badge">Owned</span>
            <span className="plot-id">PLOT-0417</span>
          </div>
          <div className="plot-visual">
            <div className="pin" />
          </div>
          <div className="plot-meta">
            <div>
              <span>Segment size</span>
              <strong>60 × 40 m</strong>
            </div>
            <div>
              <span>Status</span>
              <strong style={{ color: 'var(--gold)' }}>Minted</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Flow() {
  const steps = [
    { title: 'Select a segment', body: 'Pick the exact plot you want from the live map.' },
    { title: 'Pay on BDX', body: 'Confirm the price from your connected wallet.' },
    { title: 'Mint to your wallet', body: 'The NFT is minted directly to you.' },
    { title: 'Stay notified', body: 'Hear about anything that happens on your plot.' },
  ];

  return (
    <section className="section" id="flow">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">The flow</span>
          <h2>From the map to your wallet</h2>
        </div>
        <div className="flow-steps">
          {steps.map((s, i) => (
            <div className="flow-step" key={s.title}>
              <div className="idx">{String(i + 1).padStart(2, '0')}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="section-tag">Ownership</span>
          <h2>What owning a plot means</h2>
        </div>
        <div className="guarantee">
          <div className="guarantee-cell">
            <h3>Exclusive by design</h3>
            <p>Each segment can be minted once. After purchase, it's locked out for everyone else.</p>
          </div>
          <div className="guarantee-cell">
            <h3>Tied to a real place</h3>
            <p>Your token is bound to real coordinates, not generic artwork.</p>
          </div>
          <div className="guarantee-cell">
            <h3>Ongoing, not one-off</h3>
            <p>You stay notified about your plot for as long as you hold it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="cta-band">
      <div className="wrap">
        <h2>Pick your plot before someone else does</h2>
        <Link to="/app" className="btn-primary">Launch App</Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-mark"> <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-cyan-400"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>Next Universe</div>
            <p>Real map segments, minted as NFTs, owned by one wallet only.</p>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <div className="footer-contact-row">
              <span className="icon">☎</span>
              <a href="tel:+919150800518">+91 91508 00518</a>
            </div>
            <div className="footer-contact-row">
              <span className="icon">✉</span>
              <a href="mailto:balamurugannagarajan.vm@gmail.com">balamurugannagarajan.vm@gmail.com</a>
            </div>
            <p className="footer-creator">Created by <strong>Balamurugan Nagarajan</strong></p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Next Universe</span>
        </div>
      </div>
    </footer>
  );
}
