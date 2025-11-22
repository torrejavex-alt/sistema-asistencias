import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import { ReporteAsistencias } from './pages/ReporteAsistencias';
import Analiticas from './pages/Analiticas';
import Usuarios from './pages/Usuarios';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
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
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;