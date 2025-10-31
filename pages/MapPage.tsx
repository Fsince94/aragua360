
import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import type { Place } from '../types';
import L from 'leaflet';
import FloatingActionButton from '../components/FloatingActionButton';
import { Lock, Unlock, MapPin } from 'lucide-react';

// ⚙️ Usamos 'L.divIcon' para crear íconos de marcador personalizados con TailwindCSS.
//    Esto nos da total control sobre la apariencia de los marcadores.
const createIcon = (isUnlocked: boolean, isDarkMode: boolean) => {
  const bgColor = isUnlocked ? 'bg-sun-dark' : 'bg-gray-500';
  const textColor = 'text-white';
  const iconHtml = isUnlocked 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

  return L.divIcon({
    html: `<div class="p-2 ${bgColor} ${textColor} rounded-full shadow-lg flex items-center justify-center">${iconHtml}</div>`,
    className: '', // Tailwind classes are in the html
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};


const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUnlocked } = usePlaces();
  const [position, setPosition] = useState<[number, number]>([10.3, -67.6]);
  const mapRef = useRef<L.Map | null>(null);
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // 🧩 Esta función maneja la navegación cuando se hace clic en un marcador.
  //    Si el lugar está desbloqueado, va a la galería. Si no, va al escáner.
  //    Es un buen ejemplo de lógica de control de flujo basada en el estado de la aplicación.
  const handleMarkerClick = (place: Place) => {
    if (isUnlocked(place.id)) {
      navigate(`/gallery/${place.id}`);
    } else {
      navigate(`/scan/${place.id}`);
    }
  };
  
  const centerOnUser = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 15);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        alert('No se pudo obtener tu ubicación.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer center={position} zoom={9} ref={mapRef} className="h-full w-full z-0" zoomControl={false}>
        <TileLayer
          url={isDarkMode 
               ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
               : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        {TOURIST_PLACES.map((place) => {
          const unlocked = isUnlocked(place.id);
          return (
            <Marker
              key={place.id}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={createIcon(unlocked, isDarkMode)}
              eventHandlers={{
                click: () => handleMarkerClick(place),
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">{place.name}</h3>
                  <p className="text-sm mb-2">{place.description}</p>
                   <button
                    onClick={() => handleMarkerClick(place)}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${unlocked ? 'bg-sun hover:bg-sun-dark' : 'bg-lake hover:bg-lake-dark'}`}
                  >
                    {unlocked ? <Unlock size={16} /> : <Lock size={16} />}
                    {unlocked ? 'Ver Galería' : 'Escanear QR'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <FloatingActionButton centerOnUser={centerOnUser}/>
    </div>
  );
};

export default MapPage;
