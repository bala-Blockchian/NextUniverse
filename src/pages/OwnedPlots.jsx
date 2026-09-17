import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import GridField from '../components/GridField.jsx';
import JazziconAvatar from '../components/JazziconAvatar.jsx';
import { OWNED_PLOTS, shorten } from '../data/plots.js';
import '../styles/app.css';

export default function OwnedPlots() {
  const { isConnected, address } = useAccount();
  const displayAddress = isConnected && address;

  return (
    <div className="app-shell">
      {/* <GridField dense /> */}
      <div className="app-fade" />

      <header className="app-top">
        <div className="wrap app-top-inner">
          <Link to="/" className="app-back" aria-label="Back to home">←</Link>
          <Link to="/" className="app-brand">
            {/* <span className="dot" /> */}
            Next Universe
          </Link>
          <nav className="app-actions">
            <Link to="/app" className="btn-ghost btn-owned">Back to map</Link>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </nav>
        </div>
      </header>

      <main className="wrap owned-main">
        <aside className="profile-card">
          <div className="profile-avatar">
            <JazziconAvatar address={displayAddress} diameter={112} />
          </div>
          <span className="section-tag">Collector</span>
          <h1 className="profile-name">{shorten(displayAddress)}</h1>
          <p className="profile-sub">
            {isConnected ? 'Connected wallet' : 'Sample account — connect to see your plots'}
          </p>
          <div className="profile-stats">
            <div>
              <span>Plots owned</span>
              <strong>{OWNED_PLOTS.length}</strong>
            </div>
            <div>
              <span>Total value</span>
              <strong>
                {OWNED_PLOTS.reduce((s, p) => s + p.priceBdx, 0).toLocaleString()} BDX
              </strong>
            </div>
          </div>
        </aside>

        <section className="owned-panel">
          <span className="section-tag">Your plots</span>
          <div className="owned-grid">
            {OWNED_PLOTS.map((p) => (
              <article className="owned-card" key={p.id}>
                <div className="owned-card-head">
                  <div>
                    <span className="plot-status minted">Minted</span>
                    <h2 className="owned-card-name">{p.name}</h2>
                    <p className="owned-card-place">{p.place}</p>
                  </div>
                  <span className="plot-id-mon">{p.id}</span>
                </div>

                <dl className="plot-facts">
                  <div>
                    <dt>Latitude</dt>
                    <dd>{p.lat.toFixed(4)}° N</dd>
                  </div>
                  <div>
                    <dt>Longitude</dt>
                    <dd>{p.lng.toFixed(4)}° E</dd>
                  </div>
                  <div>
                    <dt>Area</dt>
                    <dd>{p.areaSqm} m²</dd>
                  </div>
                  <div>
                    <dt>Token ID</dt>
                    <dd>#{p.tokenId}</dd>
                  </div>
                </dl>

                <div className="owned-meta">
                  <div>
                    <span>Minted</span>
                    <time>{p.mintedAt}</time>
                  </div>
                  <div>
                    <span>Cost</span>
                    <strong>
                      {p.priceBdx.toLocaleString()} BDX <em>≈ ${p.priceUsd}</em>
                    </strong>
                  </div>
                  <div>
                    <span>Tx</span>
                    <code>{shorten(p.txHash)}</code>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}