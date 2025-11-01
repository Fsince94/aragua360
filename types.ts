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
  description?: string; // ⚙️ La descripción es ahora opcional.
  coordinates: Coordinates;
  qrCodeValue: string;
  imageUrl: string;
}

export interface PlacesContextType {
  unlockedIds: Set<string>;
  unlockPlace: (id: string) => void;
  isUnlocked: (id: string) => boolean;
}

export interface AdminPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  imageUrl: string;
  qrCodeUrl: string;
}

// 💡 Tipo para los datos necesarios al crear un nuevo lugar.
export type PlaceDataToCreate = Omit<AdminPlace, 'id' | 'qrCodeUrl'>;

// 💡 Se actualiza el tipo del contexto dinámico para incluir las funciones de manipulación de datos.
//    Estas funciones permitirán que la app sea autónoma, guardando todo en el navegador.
export interface DynamicPlacesContextType {
  places: AdminPlace[];
  isLoading: boolean;
  error: string | null;
  refetchPlaces: () => void;
  addPlace: (data: PlaceDataToCreate) => void;
  updatePlace: (data: AdminPlace) => void;
  deletePlace: (id: string) => void;
}

// 💡 Declaramos tipos globales para las librerías cargadas vía <script>
//    Esto le dice a TypeScript que espere encontrar estas variables en el
//    ámbito global (window), evitando errores de tipo.
declare global {
  // eslint-disable-next-line no-var
  var ZXingBrowser: any;
}