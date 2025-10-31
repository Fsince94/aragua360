
// 💡 Aquí definimos las "interfaces" que describen la forma de nuestros datos.
//    Esto es clave en TypeScript para evitar errores y hacer el código más predecible.
//    Sigue el principio de Segregación de Interfaces (ISP), ya que cada tipo tiene un propósito claro.

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  coordinates: Coordinates;
  qrCodeValue: string;
  imageUrl360: string;
}

export interface PlacesContextType {
  unlockedIds: Set<string>;
  unlockPlace: (id: string) => void;
  isUnlocked: (id: string) => boolean;
}
