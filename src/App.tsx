import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navbar';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import WorldBuilder from './pages/WorldBuilder';
import CharacterDesigner from './pages/CharacterDesigner';
import OutlinePlanner from './pages/OutlinePlanner';
import Writer from './pages/Writer';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/world-builder" element={<WorldBuilder />} />
        <Route path="/character-designer" element={<CharacterDesigner />} />
        <Route path="/outline-planner" element={<OutlinePlanner />} />
        <Route path="/writer" element={<Writer />} />
      </Routes>
    </Router>
  );
}

export default App;
