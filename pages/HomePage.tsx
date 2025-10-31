import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import type { Place } from '../types';
import { Lock, Unlock, List, Map as MapIcon } from 'lucide-react';
import MapPage from './MapPage';

// 💡 HomePage ahora gestiona dos vistas: un mapa interactivo y una lista filtrable.
//    Se ha reestructurado para permitir una transición fluida entre ambas.

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isUnlocked } = usePlaces();
    const [view, setView] = useState<'map' | 'list'>('map');
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    const filteredPlaces = useMemo(() => {
        return TOURIST_PLACES.filter(place => {
            if (filter === 'all') return true;
            const unlocked = isUnlocked(place.id);
            if (filter === 'unlocked') return unlocked;
            if (filter === 'locked') return !unlocked;
            return false;
        });
    }, [filter, isUnlocked]);
    
    const handlePrimaryAction = (place: Place) => {
        navigate(isUnlocked(place.id) ? `/gallery/${place.id}` : `/scan/${place.id}`);
    };

    const FilterPill: React.FC<{ label: string; value: 'all' | 'unlocked' | 'locked'; }> = ({ label, value }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                filter === value
                    ? 'bg-brand-green text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-4 bg-brand-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-green dark:text-brand-white">Explorar Aragua</h1>
                    <button
                        onClick={() => setView(v => v === 'map' ? 'list' : 'map')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        aria-label={view === 'map' ? "Mostrar lista" : "Mostrar mapa"}
                    >
                        {view === 'map' ? <List size={20} /> : <MapIcon size={20} />}
                    </button>
                </div>
                {/* ⚙️ Los filtros solo se muestran en la vista de lista para mantener la UI limpia. */}
                {view === 'list' && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        <FilterPill label="Todos" value="all" />
                        <FilterPill label="Desbloqueados" value="unlocked" />
                        <FilterPill label="Bloqueados" value="locked" />
                    </div>
                )}
            </header>

            {/* ⚙️ Optimización de rendimiento: Ambas vistas se mantienen en el DOM para preservar el estado del mapa. */}
            <div className="flex-grow relative">
                 <div style={{ display: view === 'map' ? 'block' : 'none' }} className="h-full w-full">
                    <MapPage />
                </div>
                <div style={{ display: view === 'list' ? 'block' : 'none' }} className="h-full w-full">
                    <div className="flex-grow h-full">
                        <ul className="p-4 space-y-3 overflow-y-auto h-full">
                            {filteredPlaces.map(place => {
                                const unlocked = isUnlocked(place.id);
                                return (
                                    <li key={place.id} 
                                        onClick={() => handlePrimaryAction(place)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-pointer">
                                        <div className={`flex-shrink-0 p-3 rounded-full ${unlocked ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`} >
                                            {unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-gray-800 dark:text-white truncate">{place.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{place.description}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;