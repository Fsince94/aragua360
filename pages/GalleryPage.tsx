
import React, { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Pannellum } from 'pannellum-react';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import { ArrowLeft, Map } from 'lucide-react';

const GalleryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isUnlocked } = usePlaces();
  
  // 🧩 'useMemo' optimiza el rendimiento al evitar que la búsqueda del lugar se repita
  //    en cada render, a menos que el 'id' cambie.
  const place = useMemo(() => TOURIST_PLACES.find(p => p.id === id), [id]);

  // ⚙️ Lógica de protección de ruta. Si el lugar no existe o no está desbloqueado,
  //    se redirige al usuario al mapa principal. Esto asegura que solo el contenido
  //    autorizado sea accesible.
  if (!place || !isUnlocked(place.id)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative h-full w-full bg-black">
      <Pannellum
        width="100%"
        height="100%"
        image={place.imageUrl360}
        pitch={10}
        yaw={180}
        hfov={110}
        autoLoad
        showZoomCtrl={false}
        showFullscreenCtrl={false}
      >
        <Pannellum.Hotspot type="info" pitch={10} yaw={-160} text={place.description} />
      </Pannellum>

      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white hover:bg-white/50 transition-colors">
          <ArrowLeft />
        </button>
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-white">
          <h1 className="text-xl font-bold">{place.name}</h1>
        </div>
      </div>
       <button onClick={() => navigate('/')} className="absolute bottom-6 right-6 z-10 p-4 bg-lake rounded-full text-white shadow-lg hover:bg-lake-dark transition-transform hover:scale-110 flex items-center gap-2">
         <Map size={24}/>
         <span className="font-semibold hidden sm:block">Volver al Mapa</span>
      </button>
    </div>
  );
};

export default GalleryPage;
