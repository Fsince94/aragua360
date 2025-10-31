import React, { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
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
    <div className="relative h-full w-full bg-black flex flex-col justify-end">
      <img 
        src={place.imageUrl} 
        alt={`Vista de ${place.name}`} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>

      {/* Botón para volver atrás */}
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/30 backdrop-blur-sm rounded-full text-white hover:bg-white/50 transition-colors">
          <ArrowLeft />
        </button>
      </div>
      
      {/* Contenido de texto */}
      <div className="relative z-20 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{place.name}</h1>
          <p className="text-base drop-shadow-md">{place.description}</p>
      </div>

       {/* Botón para volver al mapa */}
       <button onClick={() => navigate('/')} className="absolute bottom-6 right-6 z-20 p-4 bg-lake rounded-full text-white shadow-lg hover:bg-lake-dark transition-transform hover:scale-110 flex items-center gap-2">
         <Map size={24}/>
         <span className="font-semibold hidden sm:block">Volver al Mapa</span>
      </button>
    </div>
  );
};

export default GalleryPage;