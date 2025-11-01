import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Image as ImageIcon, QrCode, PlusCircle, Save, X, Camera, Loader2, LocateFixed, Edit, Trash2 } from 'lucide-react';
import type { Coordinates, AdminPlace, PlaceDataToCreate } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useDynamicPlaces } from '../hooks/useDynamicPlaces'; // 💡 Se importa el hook de datos dinámicos.

// FIX: Workaround for a TypeScript error where framer-motion props are not recognized.
const MotionDiv = motion.div as any;

// 💡 Ya no se necesita una URL de backend. La app es autónoma.
// const GOOGLE_SCRIPT_URL = '...';

// --- Sub-componentes Modales ---

// 🧩 Modal refactorizado para mostrar una imagen estándar.
//    Ya no usa Photo Sphere Viewer, ahora es un visor simple y elegante
//    para cualquier URL de imagen, como las de Imgur.
const ViewerModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-4xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <img src={imageUrl} alt="Vista previa" className="w-full h-full object-contain rounded-lg"/>
        <button onClick={onClose} className="absolute -top-2 -right-2 p-2 bg-white/30 rounded-full text-white backdrop-blur-sm">
          <X size={24} />
        </button>
      </div>
    </MotionDiv>
  );
};

const ScannerModal: React.FC<{ onClose: () => void; onScanSuccess: (url: string) => void; }> = ({ onClose, onScanSuccess }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<any>(null);

    useEffect(() => {
        if (videoRef.current) {
            const codeReader = new ZXingBrowser.BrowserQRCodeReader();
            codeReaderRef.current = codeReader;

            codeReader.decodeFromInputVideoDevice(undefined, videoRef.current)
                .then((result: any) => {
                    onScanSuccess(result.getText());
                })
                .catch((err: any) => {
                    if (!(err instanceof ZXingBrowser.NotFoundException) && !(err instanceof ZXingBrowser.ArgumentException)) {
                        console.error(err);
                        alert(`Error al escanear: ${err.message}`);
                    }
                });
        }
        
        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, [onScanSuccess]);

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
            <h2 className="text-white text-xl font-bold mb-4">Escanea un QR de imagen</h2>
            <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" />
            </div>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg"> Cancelar </button>
        </MotionDiv>
    );
};

const MapSelectorModal: React.FC<{
  onClose: () => void;
  onCoordsSelected: (coords: Coordinates) => void;
  initialCoords: Coordinates | null;
}> = ({ onClose, onCoordsSelected, initialCoords }) => {
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(
    initialCoords ? new L.LatLng(initialCoords.lat, initialCoords.lng) : null
  );
  const mapRef = useRef<L.Map>(null);

  const MapEvents = () => {
    useMapEvents({ click(e) { setSelectedPosition(e.latlng); } });
    return null;
  };
  
  const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  
  const centerOnUser = () => {
    mapRef.current?.locate().on("locationfound", function (e) {
        mapRef.current?.flyTo(e.latlng, 15);
        setSelectedPosition(e.latlng);
    });
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onCoordsSelected({ lat: selectedPosition.lat, lng: selectedPosition.lng });
      onClose();
    } else {
      alert("Por favor, selecciona un punto en el mapa.");
    }
  };

  const mapInitialCenter: [number, number] = initialCoords ? [initialCoords.lat, initialCoords.lng] : [10.3, -67.6];

  return (
    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="p-4 text-xl font-bold border-b dark:border-gray-700">Selecciona la Ubicación</h2>
        <div className="flex-grow relative">
          <MapContainer center={mapInitialCenter} zoom={13} className="w-full h-full" ref={mapRef}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
            <MapEvents />
            {selectedPosition && <Marker position={selectedPosition} icon={markerIcon} />}
          </MapContainer>
          <button onClick={centerOnUser} className="absolute top-4 right-4 z-[1000] p-2 bg-white dark:bg-gray-700 rounded-full shadow-md text-black dark:text-white" title="Centrar en mi ubicación">
            <LocateFixed size={20}/>
          </button>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 flex justify-end gap-4 border-t dark:border-gray-700">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg">Cancelar</button>
          <button onClick={handleConfirm} disabled={!selectedPosition} className="px-6 py-2 bg-brand-green text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Confirmar</button>
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Componente Principal ---

const ProfilePage: React.FC = () => {
  // 💡 Se obtienen las funciones de manipulación de datos del contexto.
  const { places, isLoading, error: fetchError, addPlace, updatePlace, deletePlace } = useDynamicPlaces();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isPlaceListVisible, setIsPlaceListVisible] = useState(true);

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setCurrentCoords(null);
    setEditingPlaceId(null);
  };
  
  const handleEdit = (place: AdminPlace) => {
    setEditingPlaceId(place.id);
    setName(place.name);
    setImageUrl(place.imageUrl);
    setCurrentCoords({ lat: place.lat, lng: place.lng });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (placeId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este lugar? Esta acción es irreversible.")) {
      return;
    }
    // 💡 Se llama directamente a la función del contexto.
    deletePlace(placeId);
    alert("¡Lugar eliminado con éxito!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imageUrl || !currentCoords) {
      alert("Por favor, completa el nombre, la URL y selecciona las coordenadas.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingPlaceId) {
        // ⚙️ Se está actualizando un lugar existente.
        const placeToUpdate: AdminPlace = {
          id: editingPlaceId,
          name,
          lat: currentCoords.lat,
          lng: currentCoords.lng,
          imageUrl,
          qrCodeUrl: '', // El contexto la regenerará
        };
        updatePlace(placeToUpdate);
      } else {
        // ⚙️ Se está creando un lugar nuevo.
        const placeToCreate: PlaceDataToCreate = {
          name,
          lat: currentCoords.lat,
          lng: currentCoords.lng,
          imageUrl,
        };
        addPlace(placeToCreate);
      }

      alert(`¡Lugar ${editingPlaceId ? 'actualizado' : 'guardado'} con éxito!`);
      resetForm();
      
    } catch (err) {
      console.error("Failed to submit place", err);
      setSubmitError("Error al guardar en el almacenamiento del navegador.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleScanSuccess = (url: string) => {
    setIsScanning(false);
    setViewerUrl(url);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 dark:bg-gray-900 min-h-full">
      <AnimatePresence>
        {viewerUrl && <ViewerModal imageUrl={viewerUrl} onClose={() => setViewerUrl(null)} />}
        {isScanning && <ScannerModal onClose={() => setIsScanning(false)} onScanSuccess={handleScanSuccess} />}
        {isMapModalOpen && <MapSelectorModal onClose={() => setIsMapModalOpen(false)} onCoordsSelected={(coords) => setCurrentCoords(coords)} initialCoords={currentCoords} />}
      </AnimatePresence>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona los puntos de interés de Aragua 360.</p>
        </div>
        <button onClick={() => setIsScanning(true)} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-brand-green text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
            <Camera size={18} /> Escanear QR
        </button>
      </header>

      {(fetchError || submitError) && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{fetchError || submitError}</p></div>}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {editingPlaceId ? <Edit size={22} /> : <PlusCircle size={22}/>}
            {editingPlaceId ? 'Editar Lugar' : 'Añadir Nuevo Lugar'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Nombre del lugar" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-brand-green"/>
            <div>
              <input type="url" placeholder="URL de la imagen (ej. Imgur)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-brand-green"/>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1">
                💡 Pega el enlace de la página de Imgur (ej: imgur.com/aBcDeF). Lo convertiremos automáticamente.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <MapPin size={16} />
                <span>Coords: {currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : "No seleccionadas"}</span>
              </div>
              <button type="button" onClick={() => setIsMapModalOpen(true)} className="px-4 py-2 text-sm border border-brand-green text-brand-green rounded-md hover:bg-brand-green/10 transition-colors">Seleccionar en Mapa</button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {editingPlaceId && (
                <button type="button" onClick={resetForm} className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-600 font-bold rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
              )}
              <button type="submit" disabled={isSubmitting || !currentCoords} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-green text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSubmitting ? "Guardando..." : (editingPlaceId ? "Actualizar" : "Guardar Lugar")}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-semibold">Lugares Existentes</h2>
            {/* 🧩 Interruptor para mostrar/ocultar la lista de lugares */}
           <label htmlFor="toggle-places" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  id="toggle-places"
                  className="sr-only"
                  checked={isPlaceListVisible}
                  onChange={() => setIsPlaceListVisible(!isPlaceListVisible)}
                />
                <div className="block bg-gray-200 dark:bg-gray-700 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${isPlaceListVisible ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </label>
        </div>
        <AnimatePresence>
         {isPlaceListVisible && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8"><Loader2 size={32} className="animate-spin text-brand-green"/></div>
                ) : places.length > 0 ? (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Vista Previa</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Coordenadas</th>
                            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {places.map((place) => (
                            <tr key={place.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 align-middle">
                                <td className="p-4">
                                  <img 
                                    src={place.imageUrl} 
                                    alt={`Vista previa de ${place.name}`} 
                                    className="w-24 h-16 object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-110"
                                    onClick={() => setViewerUrl(place.imageUrl)}
                                    title="Haz clic para ver la imagen completa"
                                  />
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap dark:text-white">{place.name}</th>
                                <td className="px-6 py-4">{`${Number(place.lat).toFixed(4)}, ${Number(place.lng).toFixed(4)}`}</td>
                                <td className="px-6 py-4 flex items-center justify-center gap-4">
                                    <a href={place.qrCodeUrl} target="_blank" rel="noopener noreferrer" title="Ver código QR" className="font-medium text-purple-500 hover:underline flex items-center gap-1"><QrCode size={14}/> QR</a>
                                    <button onClick={() => handleEdit(place)} title="Editar lugar" className="font-medium text-yellow-500 hover:underline flex items-center gap-1"><Edit size={14}/> Editar</button>
                                    <button onClick={() => handleDelete(place.id)} title="Eliminar lugar" className="font-medium text-red-500 hover:underline flex items-center gap-1"><Trash2 size={14}/> Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay lugares guardados todavía.</p>
                )}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;