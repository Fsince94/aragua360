import React, { useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { useDynamicPlaces } from '../hooks/useDynamicPlaces'; // 💡 Se importa el hook de datos dinámicos.
import { ArrowLeft } from 'lucide-react';

const GalleryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isUnlocked } = usePlaces();
  const { places: dynamicPlaces, isLoading } = useDynamicPlaces(); // ⚙️ Se obtienen los lugares del contexto.
  
  // 🧩 'useMemo' ahora busca el lugar en la lista dinámica obtenida del contexto.
  const place = useMemo(() => dynamicPlaces.find(p => p.id === id), [id, dynamicPlaces]);

  // ⚙️ Se añade una comprobación de carga para evitar renderizados prematuros.
  if (isLoading) {
    return <div className="h-full w-full bg-black flex items-center justify-center text-white">Cargando galería...</div>;
  }
  
  // ⚙️ Lógica de protección de ruta. Si el lugar no existe o no está desbloqueado, se redirige.
  if (!place || !isUnlocked(place.id)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative h-full w-full bg-black flex flex-col justify-end">
      {/* 💡 Se usa 'imageUrl' que es el campo disponible en los datos dinámicos. */}
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
          {/* ⚙️ El campo 'description' ya no se muestra porque no está garantizado en los datos dinámicos. */}
      </div>
    </div>
  );
};

export default GalleryPage;