import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaces } from '../hooks/usePlaces';
import { useDynamicPlaces } from '../hooks/useDynamicPlaces'; // 💡 Se importa el hook de datos dinámicos.
import type { AdminPlace } from '../types';
import { Lock, Unlock, List, LayoutGrid, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Workaround for a TypeScript error where framer-motion props are not recognized.
const MotionLi = motion.li as any;
const MotionDiv = motion.div as any;

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isUnlocked } = usePlaces();
    const { places, isLoading } = useDynamicPlaces(); // ⚙️ Se obtienen los lugares del contexto dinámico.
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    const filteredPlaces = useMemo(() => {
        return places.filter(place => {
            if (filter === 'all') return true;
            const unlocked = isUnlocked(place.id);
            if (filter === 'unlocked') return unlocked;
            if (filter === 'locked') return !unlocked;
            return false;
        });
    }, [filter, isUnlocked, places]);
    
    // ⚙️ La acción principal ahora navega a la página de escaneo con el ID del lugar dinámico.
    const handlePrimaryAction = (place: AdminPlace) => {
        // La galería también usará el id, y verificará el estado de desbloqueo internamente.
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

    // 🧩 Tarjeta para la vista de galería (grid).
    const PlaceCard: React.FC<{ place: AdminPlace }> = ({ place }) => {
        const unlocked = isUnlocked(place.id);
        return (
            <MotionLi
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={() => handlePrimaryAction(place)}
                className="relative aspect-square bg-gray-500 rounded-lg shadow-md overflow-hidden cursor-pointer group"
            >
                {/* 💡 Se utiliza imageUrl, que es el campo disponible. */}
                <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 text-white">
                    <h3 className="font-bold drop-shadow-md">{place.name}</h3>
                </div>
                <div className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm ${unlocked ? 'bg-brand-yellow/50 text-white' : 'bg-black/50 text-white'}`}>
                    {unlocked ? <Unlock size={16} /> : <Lock size={16} />}
                </div>
            </MotionLi>
        );
    };

    // 🧩 Elemento para la vista de lista.
    const PlaceListItem: React.FC<{ place: AdminPlace }> = ({ place }) => {
        const unlocked = isUnlocked(place.id);
        return (
            <MotionLi
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                onClick={() => handlePrimaryAction(place)}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4 cursor-pointer"
            >
                <div className={`flex-shrink-0 p-3 rounded-full ${unlocked ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`} >
                    {unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-bold truncate">{place.name}</h3>
                     {/* ⚙️ El campo 'description' ya no se muestra. */}
                </div>
            </MotionLi>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-4 bg-brand-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-green dark:text-brand-white">Explorar Aragua</h1>
                    <button
                        onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        aria-label={view === 'grid' ? "Mostrar lista" : "Mostrar galería"}
                    >
                        {view === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
                    </button>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    <FilterPill label="Todos" value="all" />
                    <FilterPill label="Desbloqueados" value="unlocked" />
                    <FilterPill label="Bloqueados" value="locked" />
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                 {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-brand-green" size={48} />
                    </div>
                 ) : (
                    <AnimatePresence mode="wait">
                        <MotionDiv
                            key={view}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {view === 'grid' ? (
                                <ul className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {filteredPlaces.map(place => <PlaceCard key={place.id} place={place} />)}
                                </ul>
                            ) : (
                                <ul className="p-4 space-y-3">
                                    {filteredPlaces.map(place => <PlaceListItem key={place.id} place={place} />)}
                                </ul>
                            )}
                        </MotionDiv>
                    </AnimatePresence>
                 )}
            </main>
        </div>
    );
};

export default HomePage;