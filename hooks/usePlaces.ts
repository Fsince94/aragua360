
import { useContext } from 'react';
import { PlacesContext } from '../context/PlacesContext';
import type { PlacesContextType } from '../types';

// 🧩 Este es un "custom hook". Es una función que nos permite reutilizar lógica de estado
//    y efectos en diferentes componentes. Simplifica el acceso al contexto.
//    Aplica el principio de Responsabilidad Única (SRP) al encargarse exclusivamente
//    de la conexión con 'PlacesContext'.

export const usePlaces = (): PlacesContextType => {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
};
