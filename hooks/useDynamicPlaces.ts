import { useContext } from 'react';
import { DynamicPlacesContext } from '../context/DynamicPlacesContext';
import type { DynamicPlacesContextType } from '../types';

// 🧩 Este es un "custom hook" para el nuevo contexto de lugares dinámicos.
//    Aplica el principio de Responsabilidad Única (SRP) al encargarse exclusivamente
//    de la conexión con 'DynamicPlacesContext'.
//    Simplifica el acceso a los datos dinámicos en toda la aplicación.

export const useDynamicPlaces = (): DynamicPlacesContextType => {
  const context = useContext(DynamicPlacesContext);
  if (context === undefined) {
    throw new Error('useDynamicPlaces debe ser usado dentro de un DynamicPlacesProvider');
  }
  return context;
};
