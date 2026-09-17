import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import MintApp from './pages/MintApp.jsx';
import OwnedPlots from './pages/OwnedPlots.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<MintApp />} />
      <Route path="/app/owned" element={<OwnedPlots />} />
    </Routes>
  );
}
