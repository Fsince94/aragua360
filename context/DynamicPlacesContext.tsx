import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { AdminPlace, DynamicPlacesContextType, PlaceDataToCreate } from '../types';
import { convertToDirectImgurUrl } from '../utils/imageUrlHelper'; // 💡 Se importa la nueva utilidad.

// 💡 Este contexto aplica el principio de Inversión de Dependencias (DIP).
//    Los componentes que lo consumen dependen de la abstracción 'DynamicPlacesContext',
//    no de la implementación de la obtención de datos (que ahora es localStorage).

export const DynamicPlacesContext = createContext<DynamicPlacesContextType | undefined>(undefined);

// ⚙️ Se define una clave para guardar los lugares en el almacenamiento local del navegador.
const PLACES_STORAGE_KEY = 'aragua360-dynamic-places';

// 💡 Datos iniciales de ejemplo para la primera vez que se usa la app.
const getInitialPlaces = (): AdminPlace[] => [
  {
    id: 'choroni-1',
    name: 'Malecón de Choroní',
    lat: 10.509,
    lng: -67.605,
    imageUrl: 'https://i.imgur.com/O4aaTj2.jpg', // Usando URL directa de Imgur
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fi.imgur.com%2FO4aaTj2.jpg'
  },
  {
    id: 'tovari-2',
    name: 'Colonia Tovar',
    lat: 10.425,
    lng: -67.291,
    imageUrl: 'https://i.imgur.com/5i3uE3j.jpg', // Usando URL directa de Imgur
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fi.imgur.com%2F5i3uE3j.jpg'
  }
];

export const DynamicPlacesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ⚙️ Este 'useEffect' se ejecuta una sola vez para cargar los datos desde localStorage.
  //    Si no hay datos guardados, carga un conjunto de lugares de ejemplo.
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedPlaces = localStorage.getItem(PLACES_STORAGE_KEY);
      if (storedPlaces) {
        setPlaces(JSON.parse(storedPlaces));
      } else {
        const initialData = getInitialPlaces();
        setPlaces(initialData);
        localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (err) {
      console.error("Fallo al cargar lugares desde localStorage:", err);
      setError("No se pudieron cargar los lugares guardados en el navegador.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchPlaces = useCallback(() => {
    // ⚙️ Ahora, "refrescar" significa simplemente releer desde localStorage.
     setIsLoading(true);
    try {
      const storedPlaces = localStorage.getItem(PLACES_STORAGE_KEY);
      setPlaces(storedPlaces ? JSON.parse(storedPlaces) : []);
    } catch (err) {
      console.error("Fallo al recargar lugares desde localStorage:", err);
      setError("No se pudieron recargar los lugares.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 🧩 Lógica para añadir un nuevo lugar.
  const addPlace = useCallback((data: PlaceDataToCreate) => {
    try {
      setPlaces(currentPlaces => {
        // ⚙️ Se convierte la URL a un formato directo antes de guardarla.
        const directImageUrl = convertToDirectImgurUrl(data.imageUrl);
        const encodedUrl = encodeURIComponent(directImageUrl);
        const newPlace: AdminPlace = {
          ...data,
          imageUrl: directImageUrl, // Se guarda la URL corregida.
          id: `place-${Date.now()}`,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`,
        };
        const updatedPlaces = [...currentPlaces, newPlace];
        localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(updatedPlaces));
        return updatedPlaces;
      });
    } catch (err) {
      console.error("Error guardando nuevo lugar:", err);
      setError("No se pudo guardar el nuevo lugar.");
    }
  }, []);

  // 🧩 Lógica para actualizar un lugar existente.
  const updatePlace = useCallback((data: AdminPlace) => {
     try {
      setPlaces(currentPlaces => {
        // ⚙️ Se convierte la URL a un formato directo también al actualizar.
        const directImageUrl = convertToDirectImgurUrl(data.imageUrl);
        const encodedUrl = encodeURIComponent(directImageUrl);
        const placeWithUpdatedQr = { 
            ...data, 
            imageUrl: directImageUrl, // Se guarda la URL corregida.
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}` 
        };
        
        const updatedPlaces = currentPlaces.map(p => (p.id === data.id ? placeWithUpdatedQr : p));
        localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(updatedPlaces));
        return updatedPlaces;
      });
    } catch (err) {
      console.error("Error actualizando lugar:", err);
      setError("No se pudo actualizar el lugar.");
    }
  }, []);

  // 🧩 Lógica para eliminar un lugar.
  const deletePlace = useCallback((id: string) => {
    try {
      setPlaces(currentPlaces => {
        const updatedPlaces = currentPlaces.filter(p => p.id !== id);
        localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(updatedPlaces));
        return updatedPlaces;
      });
    } catch (err) {
      console.error("Error eliminando lugar:", err);
      setError("No se pudo eliminar el lugar.");
    }
  }, []);


  // 'useMemo' asegura que el objeto 'value' del contexto solo se recalcule si sus dependencias cambian.
  const value = useMemo(() => ({
    places,
    isLoading,
    error,
    refetchPlaces,
    addPlace,
    updatePlace,
    deletePlace,
  }), [places, isLoading, error, refetchPlaces, addPlace, updatePlace, deletePlace]);

  return (
    <DynamicPlacesContext.Provider value={value}>
      {children}
    </DynamicPlacesContext.Provider>
  );
};