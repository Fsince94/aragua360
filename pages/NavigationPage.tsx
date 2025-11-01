import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useDynamicPlaces } from '../hooks/useDynamicPlaces'; // 💡 Se importa el hook para datos dinámicos.
import type { Coordinates, AdminPlace } from '../types';
import { ArrowLeft, ArrowUp, Camera, Flag, Send, Navigation as NavigationIcon } from 'lucide-react';
import { usePlaces } from '../hooks/usePlaces';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Workaround for a TypeScript error where framer-motion props are not recognized.
const MotionDiv = motion.div as any;

// 💡 Haversine formula to calculate distance between two points on Earth.
//    Es un buen ejemplo de una función de utilidad pura: recibe datos, retorna un resultado, sin efectos secundarios.
function getDistanceFromLatLonInKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord1.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

const ARRIVAL_THRESHOLD_KM = 0.05; // 50 meters

// ⚙️ Íconos personalizados para una UI de navegación más clara.
const userIcon = L.divIcon({
    html: `<div class="p-2 bg-blue-500 rounded-full shadow-lg ring-4 ring-white/50 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const destinationIcon = L.divIcon({
    html: `<div class="p-2 bg-brand-yellow rounded-full shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

const createPlaceIcon = (isUnlocked: boolean) => {
  const bgColor = isUnlocked ? 'bg-brand-green' : 'bg-brand-gray';
  const iconHtml = isUnlocked
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

  return L.divIcon({
    html: `<div class="p-1.5 ${bgColor} rounded-full shadow-sm flex items-center justify-center cursor-pointer">${iconHtml}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const NavigationPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { isUnlocked } = usePlaces();
    const { places, isLoading } = useDynamicPlaces(); // 💡 Se obtienen lugares y estado de carga del contexto.
    const mapRef = React.useRef<L.Map | null>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    // ⚙️ Se busca el lugar en la lista dinámica.
    const place = React.useMemo(() => places.find(p => p.id === id), [id, places]);

    const [userPosition, setUserPosition] = React.useState<Coordinates | null>(null);
    const [isTracking, setIsTracking] = React.useState(false);
    
    const unlockedPlaceIcon = React.useMemo(() => createPlaceIcon(true), []);
    const lockedPlaceIcon = React.useMemo(() => createPlaceIcon(false), []);

    React.useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserPosition({ lat: latitude, lng: longitude });
            },
            (error) => {
                console.error("Error watching position:", error);
                if (error.code === 1) { // PERMISSION_DENIED
                  alert("Por favor, habilita el acceso a tu ubicación para usar la navegación.");
                  navigate('/');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [navigate]);

    React.useEffect(() => {
        if (isTracking && userPosition && mapRef.current) {
            mapRef.current.panTo([userPosition.lat, userPosition.lng]);
        }
    }, [isTracking, userPosition]);
    
    // ⚙️ Las coordenadas se leen directamente de 'lat' y 'lng'.
    const placeCoordinates = place ? { lat: place.lat, lng: place.lng } : null;
    const distance = React.useMemo(() => userPosition && placeCoordinates ? getDistanceFromLatLonInKm(userPosition, placeCoordinates) : null, [userPosition, placeCoordinates]);
    const isNearby = distance !== null && distance < ARRIVAL_THRESHOLD_KM;
    const etaMinutes = distance ? Math.round((distance / 5) * 60) : null;

    // --- MODO EXPLORACIÓN/SELECCIÓN: Si no hay 'id' en la URL ---
    if (!id) {
        return (
            <div className="h-full w-full relative">
                <MapContainer center={userPosition ? [userPosition.lat, userPosition.lng] : [10.3, -67.6]} zoom={9} ref={mapRef} className="h-full w-full z-0" zoomControl={false}>
                    <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                    {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />}
                    {/* 💡 Se mapean los lugares desde el contexto dinámico. */}
                    {!isLoading && places.map((p) => {
                        const unlocked = isUnlocked(p.id);
                        return (
                            <Marker key={`select-marker-${p.id}`} position={[p.lat, p.lng]} icon={unlocked ? unlockedPlaceIcon : lockedPlaceIcon}>
                                <Popup>
                                    <div className="text-center font-sans">
                                      <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                                      {/* <p className="text-sm mb-3 text-gray-600">{p.description}</p> */}
                                       <button
                                        onClick={() => navigate(`/navigate/${p.id}`)}
                                        className="w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 bg-brand-green hover:bg-green-700"
                                      >
                                        <NavigationIcon size={16} />
                                        Navegar
                                      </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md">
                    <h1 className="text-lg font-bold">Mapa de Aragua</h1>
                </div>
            </div>
        );
    }
    
    if (isLoading) return <div className="h-full w-full flex items-center justify-center">Cargando...</div>
    if (!place) return <Navigate to="/navigate" replace />;

    const initialCenter: [number, number] = userPosition ? [userPosition.lat, userPosition.lng] : [place.lat, place.lng];

    return (
        <div className="h-full w-full relative bg-gray-800">
            <MapContainer center={initialCenter} zoom={13} ref={mapRef} className="h-full w-full z-0" zoomControl={false} scrollWheelZoom={false} dragging={!isTracking} touchZoom={!isTracking}>
                <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />}
                <Marker position={[place.lat, place.lng]} icon={destinationIcon} />
                {userPosition && <Polyline positions={[[userPosition.lat, userPosition.lng], [place.lat, place.lng]]} color="#007BFF" weight={6} dashArray="10, 10" />}
            </MapContainer>
            
            <button onClick={() => isTracking ? setIsTracking(false) : navigate('/navigate')} className="absolute top-4 left-4 z-[1001] p-3 bg-white/50 backdrop-blur-sm rounded-full text-black dark:text-white dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors">
                <ArrowLeft />
            </button>
            
            <AnimatePresence>
                {!isTracking && (
                    <MotionDiv initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 z-10 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-lg mx-auto">
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Destino</p>
                                    <h2 className="text-xl font-bold">{place.name}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {distance ? `${distance.toFixed(1)} km de distancia` : 'Calculando distancia...'}
                                    </p>
                                </div>
                                <button onClick={() => setIsTracking(true)} className="flex-shrink-0 px-6 py-3 bg-brand-green text-white rounded-xl shadow-lg hover:bg-green-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2" disabled={!userPosition}>
                                    <Send size={20} /> <span className="font-bold text-lg">Iniciar</span>
                                </button>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isTracking && (
                <>
                    {/* 🧩 UI de Navegación Activa */}
                    <MotionDiv initial={{ y: '-200%' }} animate={{ y: 0 }} exit={{ y: '-200%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute top-0 left-0 right-0 z-[1001] p-4">
                         <div className="bg-brand-green text-white rounded-lg shadow-2xl p-4 max-w-lg mx-auto flex items-center gap-4">
                             <div className="flex-shrink-0">
                                 {isNearby ? <Flag size={40} /> : <ArrowUp size={40} />}
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold">{isNearby ? 'Has Llegado' : 'Dirígete al Destino'}</h2>
                                 <p className="text-base">{isNearby ? `Ya puedes escanear el código QR en ${place.name}.` : 'La línea azul muestra la dirección general.'}</p>
                             </div>
                         </div>
                    </MotionDiv>
                    
                    <MotionDiv initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 z-[1001] p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-lg mx-auto">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-left">
                                    <p className="text-3xl font-bold text-blue-500">{etaMinutes ?? '-'} min</p>
                                    <p className="text-gray-600 dark:text-gray-300">{distance?.toFixed(1) ?? '-'} km</p>
                                </div>
                                <div className="text-right">
                                     <p className="text-sm text-gray-500 dark:text-gray-400">Destino</p>
                                     <h3 className="text-lg font-bold">{place.name}</h3>
                                </div>
                            </div>
                            {isNearby ? (
                                <button onClick={() => navigate(`/scan/${place.id}`)} className="w-full py-3 bg-brand-yellow text-gray-900 rounded-xl shadow-lg font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                    <Camera size={22} /> Escanear QR
                                </button>
                            ) : (
                                <button onClick={() => setIsTracking(false)} className="w-full py-3 bg-red-600 text-white rounded-xl shadow-lg font-bold text-lg hover:bg-red-700 transition-colors">
                                    Finalizar
                                </button>
                            )}
                        </div>
                    </MotionDiv>
                </>
                )}
             </AnimatePresence>
        </div>
    );
};

export default NavigationPage;