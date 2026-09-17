import { Link } from 'react-router-dom';
import GridField from '../components/GridField.jsx';
import '../styles/app-placeholder.css';

// Placeholder for the minting webapp. The map-selection / wallet / BDX
// payment / mint flow will be implemented separately once specified.
export default function MintApp() {
  return (
    <div className="placeholder-shell">
      <GridField dense />
      <div className="placeholder-fade" />
      <div className="placeholder-content">
        <Link to="/" className="back">← Back to site</Link>
        <span className="section-tag">App</span>
        <h1>Launching soon</h1>
        <p>The minting app — map selection, wallet connect, and BDX payment — is coming here next.</p>
      </div>
    </div>
  );
}
