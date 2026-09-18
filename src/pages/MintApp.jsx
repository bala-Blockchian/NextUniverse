import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useChainId, useDisconnect, usePublicClient, useSendTransaction, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { sepolia } from 'wagmi/chains';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { MapContainer, TileLayer, Marker, Circle, Rectangle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PLOTS, shorten } from '../data/plots.js';
import '../styles/app.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Mint fee the connected wallet pays to Next Universe (the contract owner).
const MINT_VALUE_ETH = 0.00001;
const NEXT_UNIVERSE_ADDRESS =
  import.meta.env.VITE_NEXT_UNIVERSE_ADDRESS || '0x64178A8a4d2d4197C0FA0437EC8a569EaB2FfB04';

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

function PlotMap({ plot }) {
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
      <TileLayer attribution={TILE_LAYERS.satellite.attribution} url={TILE_LAYERS.satellite.url} />
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
  const [minting, setMinting] = useState(false);
  const { isConnected, address, status } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const { disconnectAsync } = useDisconnect();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const plot = PLOTS.find((p) => p.id === selectedId);

  const handleMint = async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }
    // A stale/reconnecting connection makes wagmi throw "connector.getChainId is not a function".
    if (status !== 'connected') {
      setMintNote('Wallet is still reconnecting — give it a moment and try again.');
      return;
    }
    setMinting(true);
    try {
      // 1/2 — the connected wallet sends the mint fee to Next Universe (contract owner)
      if (chainId !== sepolia.id) {
        await switchChainAsync({ chainId: sepolia.id });
      }
      setMintNote(`Sending ${MINT_VALUE_ETH} ETH to Next Universe…`);
      const paymentHash = await sendTransactionAsync({
        to: NEXT_UNIVERSE_ADDRESS,
        value: parseEther(String(MINT_VALUE_ETH)),
        chainId: sepolia.id,
      });
      await publicClient.waitForTransactionReceipt({ hash: paymentHash });

      // 2/2 — backend pins metadata and calls mintNft as the contract owner
      setMintNote('Payment confirmed. Uploading metadata to Pinata and calling mintNft…');
      const res = await fetch(`${API_URL}/api/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plot, receiver: address, paymentTxHash: paymentHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMintNote(
        `Minted in ${data.mint.status}! Tx ${shorten(data.mint.hash)} · tokenURI ${shorten(
          data.tokenUri,
        )} · ${data.payment.valueEth} ETH sent to Next Universe`,
      );
    } catch (error) {
      const message = error?.message ?? String(error);
      // Self-heal a stale wallet session: drop the broken connection and reconnect.
      if (message.includes('is not a function') || message.includes('ConnectorUnavailableReconnecting')) {
        await disconnectAsync().catch(() => {});
        setMintNote('Wallet session went stale. Reconnecting — please try again.');
        openConnectModal?.();
      } else {
        setMintNote(`Mint failed: ${message}`);
      }
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="app-shell">
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

            <button
              className="btn-primary btn-mint"
              onClick={handleMint}
              disabled={minting || status === 'connecting' || status === 'reconnecting'}
            >
              {minting
                ? 'Minting…'
                : status === 'connecting' || status === 'reconnecting'
                  ? 'Connecting…'
                  : isConnected
                    ? 'Mint this plot'
                    : 'Connect to mint'}
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
              <span className="map-hint">Drag to explore · zoom near the gold parcel</span>
            </div>
          </div>
          <PlotMap plot={plot} />
        </section>
      </main>
    </div>
  );
}