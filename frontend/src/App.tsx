import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import { ReporteAsistencias } from './pages/ReporteAsistencias';
import Analiticas from './pages/Analiticas';
import Usuarios from './pages/Usuarios';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reportes" element={<ReporteAsistencias />} />
            <Route path="/analiticas" element={<Analiticas />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;