import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { MapContainer, TileLayer, Marker, Circle, Rectangle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GridField from '../components/GridField.jsx';
import { PLOTS, shorten } from '../data/plots.js';
import '../styles/app.css';

const pinIcon = L.divIcon({
  className: 'plot-pin',
  html: '<span class="pin-core"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const TILE_LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  },
  dark: {
    label: 'Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
};

function FlyToPlot({ plot }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([plot.lat, plot.lng], plot.zoom, { duration: 0.9 });
  }, [map, plot]);
  return null;
}

function PlotMap({ plot, layer }) {
  const d = { lat: 0.0016, lng: 0.0021 };
  const bounds = [
    [plot.lat - d.lat, plot.lng - d.lng],
    [plot.lat + d.lat, plot.lng + d.lng],
  ];

  return (
    <MapContainer
      center={[plot.lat, plot.lng]}
      zoom={plot.zoom}
      scrollWheelZoom={false}
      className="plot-map"
    >
      <TileLayer attribution={TILE_LAYERS[layer].attribution} url={TILE_LAYERS[layer].url} />
      <FlyToPlot plot={plot} />
      <Circle
        center={[plot.lat, plot.lng]}
        radius={170}
        pathOptions={{
          color: 'rgba(0,230,195,0.6)',
          weight: 1,
          fillColor: 'rgba(0,230,195,0.06)',
          fillOpacity: 1,
        }}
      />
      <Rectangle
        bounds={bounds}
        pathOptions={{
          color: '#F5B942',
          weight: 2,
          dashArray: '4 6',
          fillColor: 'rgba(245,185,66,0.14)',
          fillOpacity: 1,
        }}
      />
      <Marker position={[plot.lat, plot.lng]} icon={pinIcon}>
        <Popup>
          <strong>{plot.name}</strong>
          <br />
          {plot.place}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default function MintApp() {
  const [selectedId, setSelectedId] = useState(PLOTS[0].id);
  const [mintNote, setMintNote] = useState(null);
  const [layer, setLayer] = useState('satellite');
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const plot = PLOTS.find((p) => p.id === selectedId);

  const handleMint = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    setMintNote(
      `Mint request staged for ${plot.id}. Connect the mint API (Pinata metadata → contract call on Sepolia) to finalise.`,
    );
  };

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
            <Link to="/app/owned" className="btn-ghost btn-owned">My plots</Link>
            <ConnectButton showBalance={false} chainStatus="icon" />
          </nav>
        </div>
      </header>

      <main className="wrap app-main">
        <section className="plot-panel">
          <div className="plot-switcher">
            <span className="section-tag">Select a plot</span>
            <div className="plot-chips">
              {PLOTS.map((p) => (
                <button
                  key={p.id}
                  className={`chip ${p.id === selectedId ? 'chip-active' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          <div className="plot-card">
            <div className="plot-head">
              <div>
                <span className="plot-status available">Available</span>
                <h1 className="plot-name">{plot.name}</h1>
                <p className="plot-place">{plot.place}</p>
              </div>
              <span className="plot-id-mon">{plot.id}</span>
            </div>

            <dl className="plot-facts">
              <div>
                <dt>Latitude</dt>
                <dd>{plot.lat.toFixed(4)}° N</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{plot.lng.toFixed(4)}° E</dd>
              </div>
              <div>
                <dt>Footprint</dt>
                <dd>{plot.size}</dd>
              </div>
              <div>
                <dt>Area</dt>
                <dd>{plot.areaSqm} m²</dd>
              </div>
            </dl>

            <div className="plot-price-row">
              <div>
                <span className="plot-price-label">Price</span>
                <div className="plot-price">
                  <strong>{plot.priceBdx.toLocaleString()}</strong>
                  <span>BDX</span>
                </div>
                <div className="plot-price-usd">≈ ${plot.priceUsd} USD</div>
              </div>
              <div className="plot-sector">
                <span>Sector</span>
                <strong>{plot.sector}</strong>
              </div>
            </div>

            <button className="btn-primary btn-mint" onClick={handleMint}>
              {isConnected ? 'Mint this plot' : 'Connect to mint'}
            </button>
            {mintNote && <p className="mint-note">{mintNote}</p>}
            {isConnected && address && (
              <p className="mint-receiver">
                Receiver <code>{shorten(address)}</code>
              </p>
            )}
          </div>
        </section>

        <section className="map-panel">
          <div className="map-head">
            <span className="section-tag">Plot view</span>
            <div className="map-controls">
              {/* <div className="map-toggle" role="group" aria-label="Map style">
                {Object.entries(TILE_LAYERS).map(([key, t]) => (
                  <button
                    key={key}
                    className={`map-toggle-btn ${layer === key ? 'map-toggle-active' : ''}`}
                    onClick={() => setLayer(key)}
                  >
                    {t.label}
                  </button>
                ))} */}
              {/* </div> */}
              <span className="map-hint">Drag to explore · zoom near the gold parcel</span>
            </div>
          </div>
          <PlotMap plot={plot} layer={"satellite"} />
        </section>
      </main>
    </div>
  );
}