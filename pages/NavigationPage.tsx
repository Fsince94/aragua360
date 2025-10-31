
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { TOURIST_PLACES } from '../constants';
import type { Coordinates, Place } from '../types';
import { ArrowLeft, ArrowUp, Camera, Flag, Send } from 'lucide-react';
import { usePlaces } from '../hooks/usePlaces';
import { motion, AnimatePresence } from 'framer-motion';

// 💡 Haversine formula to calculate distance between two points on Earth.
//    Es un buen ejemplo de una función de utilidad pura: recibe datos, retorna un resultado, sin efectos secundarios.
function getDistanceFromLatLonInKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLon = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
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
    const mapRef = React.useRef<L.Map | null>(null);
    const isDarkMode = document.documentElement.classList.contains('dark');

    const place = React.useMemo(() => TOURIST_PLACES.find(p => p.id === id), [id]);

    const [userPosition, setUserPosition] = React.useState<Coordinates | null>(null);
    const [isTracking, setIsTracking] = React.useState(false);
    
    // 💡 Optimización de rendimiento: Memoizamos los íconos de los lugares.
    //    Esto evita que los íconos se recalculen en cada renderizado de la vista de selección.
    const unlockedPlaceIcon = React.useMemo(() => createPlaceIcon(true), []);
    const lockedPlaceIcon = React.useMemo(() => createPlaceIcon(false), []);

    // 🧩 Este useEffect es el corazón de la navegación en tiempo real.
    //    Se activa al montar la página y solicita la ubicación.
    React.useEffect(() => {
        // En modo selección (sin ID), también pedimos la ubicación para centrar el mapa.
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

    // ⚙️ Este efecto centra el mapa en el usuario cuando comienza el seguimiento.
    React.useEffect(() => {
        if (isTracking && userPosition && mapRef.current) {
            mapRef.current.panTo([userPosition.lat, userPosition.lng]);
        }
    }, [isTracking, userPosition]);
    
    const distance = React.useMemo(() => userPosition && place ? getDistanceFromLatLonInKm(userPosition, place.coordinates) : null, [userPosition, place]);
    const isNearby = distance !== null && distance < ARRIVAL_THRESHOLD_KM;
    const etaMinutes = distance ? Math.round((distance / 5) * 60) : null; // Simulación de ETA a 5km/h (caminando)

    // --- MODO SELECCIÓN: Si no hay 'id' en la URL ---
    if (!id) {
        return (
            <div className="h-full w-full relative">
                <MapContainer center={userPosition ? [userPosition.lat, userPosition.lng] : [10.3, -67.6]} zoom={9} ref={mapRef} className="h-full w-full z-0" zoomControl={false}>
                    <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                    {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />}
                    {TOURIST_PLACES.map((p) => (
                        <Marker key={`select-marker-${p.id}`} position={[p.coordinates.lat, p.coordinates.lng]} icon={isUnlocked(p.id) ? unlockedPlaceIcon : lockedPlaceIcon} eventHandlers={{ click: () => navigate(`/navigate/${p.id}`) }} />
                    ))}
                </MapContainer>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Selecciona un destino</h1>
                </div>
            </div>
        );
    }
    
    if (!place) return <Navigate to="/navigate" replace />;

    const initialCenter: [number, number] = userPosition ? [userPosition.lat, userPosition.lng] : [place.coordinates.lat, place.coordinates.lng];

    return (
        <div className="h-full w-full relative bg-gray-800">
            <MapContainer center={initialCenter} zoom={13} ref={mapRef} className="h-full w-full z-0" zoomControl={false} scrollWheelZoom={false} dragging={!isTracking} touchZoom={!isTracking}>
                <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
                {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />}
                <Marker position={[place.coordinates.lat, place.coordinates.lng]} icon={destinationIcon} />
                {userPosition && <Polyline positions={[[userPosition.lat, userPosition.lng], [place.coordinates.lat, place.coordinates.lng]]} color="#007BFF" weight={6} dashArray="10, 10" />}
            </MapContainer>
            
            <button onClick={() => isTracking ? setIsTracking(false) : navigate('/')} className="absolute top-4 left-4 z-[1001] p-3 bg-white/50 backdrop-blur-sm rounded-full text-gray-800 dark:text-white dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors">
                <ArrowLeft />
            </button>
            
            <AnimatePresence>
                {!isTracking && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 z-10 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-lg mx-auto">
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Destino</p>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{place.name}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {distance ? `${distance.toFixed(1)} km de distancia` : 'Calculando distancia...'}
                                    </p>
                                </div>
                                <button onClick={() => setIsTracking(true)} className="flex-shrink-0 px-6 py-3 bg-brand-green text-white rounded-xl shadow-lg hover:bg-green-700 transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2" disabled={!userPosition}>
                                    <Send size={20} /> <span className="font-bold text-lg">Iniciar</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isTracking && (
                <>
                    {/* 🧩 UI de Navegación Activa */}
                    <motion.div initial={{ y: '-200%' }} animate={{ y: 0 }} exit={{ y: '-200%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute top-0 left-0 right-0 z-[1001] p-4">
                         <div className="bg-brand-green text-white rounded-lg shadow-2xl p-4 max-w-lg mx-auto flex items-center gap-4">
                             <div className="flex-shrink-0">
                                 {isNearby ? <Flag size={40} /> : <ArrowUp size={40} />}
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold">{isNearby ? 'Has Llegado' : 'Dirígete al Destino'}</h2>
                                 <p className="text-base">{isNearby ? `Ya puedes escanear el código QR en ${place.name}.` : 'La línea azul muestra la dirección general.'}</p>
                             </div>
                         </div>
                    </motion.div>
                    
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 z-[1001] p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-lg mx-auto">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-left">
                                    <p className="text-3xl font-bold text-blue-500">{etaMinutes ?? '-'} min</p>
                                    <p className="text-gray-600 dark:text-gray-300">{distance?.toFixed(1) ?? '-'} km</p>
                                </div>
                                <div className="text-right">
                                     <p className="text-sm text-gray-500 dark:text-gray-400">Destino</p>
                                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">{place.name}</h3>
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
                    </motion.div>
                </>
                )}
             </AnimatePresence>
        </div>
    );
};

export default NavigationPage;