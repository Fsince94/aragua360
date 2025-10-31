
import type { Place } from './types';

// 🧩 Centralizamos los datos de los lugares turísticos en un solo lugar.
//    Esto facilita el mantenimiento y la escalabilidad. Si en el futuro
//    estos datos vinieran de una API, solo tendríamos que cambiar este archivo.

export const TOURIST_PLACES: Place[] = [
  {
    id: 'museo-aeronautico',
    name: 'Museo Aeronáutico de Maracay',
    description: 'Un fascinante museo dedicado a la historia de la aviación en Venezuela.',
    coordinates: { lat: 10.237, lng: -67.61 },
    qrCodeValue: 'ARAGUA360_MUSEO_AERONAUTICO',
    imageUrl360: 'https://picsum.photos/seed/aeronautico/1920/1080',
  },
  {
    id: 'parque-henri-pittier',
    name: 'Parque Nacional Henri Pittier',
    description: 'El parque nacional más antiguo de Venezuela, famoso por su biodiversidad.',
    coordinates: { lat: 10.4, lng: -67.68 },
    qrCodeValue: 'ARAGUA360_HENRI_PITTIER',
    imageUrl360: 'https://picsum.photos/seed/pittier/1920/1080',
  },
  {
    id: 'colonia-tovar',
    name: 'Colonia Tovar',
    description: 'Un pintoresco pueblo con arquitectura y cultura alemana en el corazón de Aragua.',
    coordinates: { lat: 10.408, lng: -67.291 },
    qrCodeValue: 'ARAGUA360_COLONIA_TOVAR',
    imageUrl360: 'https://picsum.photos/seed/tovar/1920/1080',
  },
    {
    id: 'choroni',
    name: 'Choroní y Puerto Colombia',
    description: 'Pueblos costeros coloniales con playas espectaculares y un ambiente vibrante.',
    coordinates: { lat: 10.505, lng: -67.604 },
    qrCodeValue: 'ARAGUA360_CHORONI',
    imageUrl360: 'https://picsum.photos/seed/choroni/1920/1080',
  },
  {
    id: 'bahia-cata',
    name: 'Bahía de Cata',
    description: 'Una de las bahías más famosas de la costa aragüeña, ideal para el disfrute familiar.',
    coordinates: { lat: 10.510, lng: -67.738 },
    qrCodeValue: 'ARAGUA360_CATA',
    imageUrl360: 'https://picsum.photos/seed/cata/1920/1080',
  }
];
