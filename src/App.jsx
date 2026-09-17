import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import MintApp from './pages/MintApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<MintApp />} />
    </Routes>
  );
}
