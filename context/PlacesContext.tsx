
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PlacesContextType } from '../types';

// 💡 Este contexto aplica el principio de Inversión de Dependencias (DIP).
//    Los componentes que consumen este contexto dependen de la abstracción 'PlacesContext',
//    no de cómo se implementa la lógica de estado (useState, localStorage, etc.).

export const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aragua360-unlocked';

export const PlacesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  // ⚙️ Este 'useEffect' se ejecuta una sola vez al cargar el componente.
  //    Su responsabilidad es leer los datos guardados en el navegador (localStorage)
  //    para restaurar el progreso del usuario. Esto es persistencia de datos del lado del cliente.
  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedIds) {
        setUnlockedIds(new Set(JSON.parse(storedIds)));
      }
    } catch (error) {
      console.error("Failed to load unlocked places from localStorage", error);
    }
  }, []);

  // 🧩 Esta función encapsula la lógica para desbloquear un lugar.
  //    Actualiza el estado y lo guarda en localStorage.
  //    'useCallback' optimiza el rendimiento evitando que la función se recree en cada render.
  const unlockPlace = useCallback((id: string) => {
    setUnlockedIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.add(id);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newIds)));
      } catch (error) {
        console.error("Failed to save unlocked places to localStorage", error);
      }
      return newIds;
    });
  }, []);

  const isUnlocked = useCallback((id: string) => unlockedIds.has(id), [unlockedIds]);
  
  // 'useMemo' asegura que el objeto 'value' del contexto solo se recalcule si sus dependencias cambian.
  // Es otra optimización de rendimiento importante en React.
  const value = useMemo(() => ({ unlockedIds, unlockPlace, isUnlocked }), [unlockedIds, unlockPlace, isUnlocked]);

  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
};
