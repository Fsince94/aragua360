import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlacesProvider } from './context/PlacesContext';
// ⚙️ Corregido: Se utiliza una ruta de importación relativa ('./') en lugar de un alias ('@/').
//    Esto es necesario para que el navegador pueda resolver el módulo correctamente
//    en un entorno sin un empaquetador (bundler) configurado para alias.
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ScannerPage from './pages/ScannerPage';
import GalleryPage from './pages/GalleryPage';
import NavigationPage from './pages/NavigationPage';

// 💡 Este componente App es el punto de entrada de la aplicación.
//    Se ha refactorizado para usar una estructura de enrutamiento anidada.
//    'MainLayout' provee la estructura visual común (como la barra de navegación inferior)
//    a las rutas principales, mientras que otras rutas como 'scan' y 'gallery'
//    se renderizan a pantalla completa.
function App() {
  return (
    <PlacesProvider>
      <HashRouter>
        <Routes>
          {/* 🧩 Rutas que usan el MainLayout con la barra de navegación */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* ⚙️ Rutas a pantalla completa que no muestran la navegación principal */}
          <Route path="/scan/:id" element={<ScannerPage />} />
          <Route path="/gallery/:id" element={<GalleryPage />} />
          
          {/* 💡 Se reintroducen las rutas de navegación a pantalla completa */}
          <Route path="/navigate" element={<NavigationPage />} />
          <Route path="/navigate/:id" element={<NavigationPage />} />
          
          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </HashRouter>
    </PlacesProvider>
  );
}

export default App;