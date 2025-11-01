import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlacesProvider } from './context/PlacesContext';
import { DynamicPlacesProvider } from './context/DynamicPlacesContext'; // 💡 Se importa el nuevo proveedor de datos dinámicos.

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ScannerPage from './pages/ScannerPage';
import GalleryPage from './pages/GalleryPage';
import NavigationPage from './pages/NavigationPage';

// 💡 El componente App ahora anida los proveedores de contexto.
//    'DynamicPlacesProvider' se encarga de obtener los lugares desde el backend,
//    mientras que 'PlacesProvider' sigue gestionando el estado de los lugares desbloqueados.
function App() {
  return (
    <DynamicPlacesProvider>
      <PlacesProvider>
        <HashRouter>
          <Routes>
            {/* 🧩 Todas las rutas ahora se anidan dentro de MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/scan/:id" element={<ScannerPage />} />
              <Route path="/gallery/:id" element={<GalleryPage />} />
              <Route path="/navigate" element={<NavigationPage />} />
              <Route path="/navigate/:id" element={<NavigationPage />} />
              
              {/* Redirección para rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </PlacesProvider>
    </DynamicPlacesProvider>
  );
}

export default App;