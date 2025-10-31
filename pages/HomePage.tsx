import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import type { Place } from '../types';
import L from 'leaflet';
import { Lock, Unlock, Map as MapIcon, List, LocateFixed } from 'lucide-react';

// ⚙️ Usamos 'L.divIcon' para crear íconos de marcador personalizados, adaptados a la nueva paleta de colores.
const createIcon = (isUnlocked: boolean) => {
  const bgColor = isUnlocked ? 'bg-brand-yellow' : 'bg-brand-gray';
  const textColor = isUnlocked ? 'text-gray-900' : 'text-white';
  const iconHtml = isUnlocked 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

  return L.divIcon({
    html: `<div class="p-2 ${bgColor} ${textColor} rounded-full shadow-lg flex items-center justify-center">${iconHtml}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// 💡 Esta es la nueva página principal, que combina mapa y lista.
//    Tiene una alta cohesión y una única responsabilidad principal (SRP): permitir al usuario
//    explorar los lugares turísticos, ya sea visual o textualmente.
const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isUnlocked } = usePlaces();
    const mapRef = useRef<L.Map | null>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    const [view, setView] = useState<'map' | 'list'>('map');
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    // 🧩 'useMemo' optimiza el rendimiento recalculando la lista de lugares
    //    solo cuando el filtro o el estado de desbloqueo cambian.
    const filteredPlaces = useMemo(() => {
        return TOURIST_PLACES.filter(place => {
            if (filter === 'all') return true;
            const unlocked = isUnlocked(place.id);
            if (filter === 'unlocked') return unlocked;
            if (filter === 'locked') return !unlocked;
            return false;
        });
    }, [filter, isUnlocked]);
    
    const handlePlaceClick = (place: Place) => {
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
          }
        );
    }, []);

    const FilterPill: React.FC<{
        label: string;
        value: 'all' | 'unlocked' | 'locked';
    }> = ({ label, value }) => {
        const isActive = filter === value;
        return (
            <button
                onClick={() => setFilter(value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive
                        ? 'bg-brand-green text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-4 bg-brand-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-green dark:text-brand-white">Explorar Aragua</h1>
                    <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center">
                        <button onClick={() => setView('map')} aria-label="Vista de Mapa" className={`p-1.5 rounded-full ${view === 'map' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                            <MapIcon size={20} className={view === 'map' ? 'text-brand-green' : 'text-gray-600 dark:text-gray-300'} />
                        </button>
                        <button onClick={() => setView('list')} aria-label="Vista de Lista" className={`p-1.5 rounded-full ${view === 'list' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                            <List size={20} className={view === 'list' ? 'text-brand-green' : 'text-gray-600 dark:text-gray-300'} />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    <FilterPill label="Todos" value="all" />
                    <FilterPill label="Desbloqueados" value="unlocked" />
                    <FilterPill label="Bloqueados" value="locked" />
                </div>
            </header>

            <div className="flex-grow relative">
                {view === 'map' ? (
                    <div className="h-full w-full">
                        <MapContainer center={[10.3, -67.6]} zoom={9} ref={mapRef} className="h-full w-full" zoomControl={true}>
                            <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                            {filteredPlaces.map((place) => {
                                const unlocked = isUnlocked(place.id);
                                return (
                                    <Marker key={place.id} position={[place.coordinates.lat, place.coordinates.lng]} icon={createIcon(unlocked)} eventHandlers={{ click: () => handlePlaceClick(place) }}>
                                        <Popup>
                                            <div className="text-center w-48">
                                                <h3 className="font-bold text-base mb-1">{place.name}</h3>
                                                <p className="text-xs mb-2">{place.description}</p>
                                                <button onClick={() => handlePlaceClick(place)} className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${unlocked ? 'bg-brand-yellow text-gray-900 hover:opacity-90' : 'bg-brand-green text-white hover:opacity-90'}`}>
                                                    {unlocked ? <Unlock size={14} /> : <Lock size={14} />}
                                                    {unlocked ? 'Ver Galería' : 'Escanear QR'}
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                        <button onClick={centerOnUser} aria-label="Centrar en mi ubicación" className="absolute bottom-6 right-6 z-[1000] p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-brand-green dark:text-white transition-transform hover:scale-110">
                            <LocateFixed size={24} />
                        </button>
                    </div>
                ) : (
                    <ul className="p-4 space-y-3 overflow-y-auto h-full">
                        {filteredPlaces.map(place => {
                            const unlocked = isUnlocked(place.id);
                            return (
                                <li key={place.id} onClick={() => handlePlaceClick(place)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02]">
                                    <div className={`flex-shrink-0 p-3 rounded-full ${unlocked ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                        {unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-bold text-gray-800 dark:text-white truncate">{place.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{place.description}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HomePage;
