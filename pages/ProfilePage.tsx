import React, { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { usePlaces } from '../hooks/usePlaces';
import { TOURIST_PLACES } from '../constants';
import { Trophy } from 'lucide-react';

// 💡 Esta página de perfil tiene una Responsabilidad Única (SRP):
//    mostrar el progreso del usuario y permitirle cambiar la configuración de la app, como el tema.
const ProfilePage: React.FC = () => {
    const { unlockedIds } = usePlaces();
    const totalPlaces = TOURIST_PLACES.length;
    const unlockedCount = unlockedIds.size;
    const progress = totalPlaces > 0 ? (unlockedCount / totalPlaces) * 100 : 0;
    
    // ⚙️ El estado y la lógica del tema se mueven aquí desde App.tsx para una mejor cohesión.
    //    Ahora esta lógica de UI solo se carga cuando el usuario visita su perfil.
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    
    // 🧩 Un SVG inline para el avatar del "granjero", como se pide en el mockup.
    //    Es un componente puramente visual.
    const FarmerIcon = () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 rounded-full bg-brand-yellow/20 p-2 text-brand-green dark:text-brand-yellow">
            <path d="M66,74 C66,74 62,80 50,80 C38,80 34,74 34,74 M66,74 L66,66 C66,66 74,58 74,50 C74,42 66,34 66,34 L66,26 C66,26 71,20 62,20 L38,20 C29,20 34,26 34,26 L34,34 C34,34 26,42 26,50 C26,58 34,66 34,66 L34,74 M42,46 C42,46 44,50 50,50 C56,50 58,46 58,46 M42,58 A4,2 0,0,1 58,58 L42,58 M26,50 A24,24 0,0,0 74,50" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    return (
        <div className="p-6 text-center">
            <header className="mb-8">
                <div className="inline-block relative">
                    <FarmerIcon />
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-brand-green rounded-full text-white ring-4 ring-brand-white dark:ring-gray-950">
                        <Trophy size={20} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">Mi Progreso</h1>
                <p className="text-gray-600 dark:text-gray-400">Viajero de Aragua</p>
            </header>

            <section className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Lugares Desbloqueados</h2>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2 overflow-hidden">
                    <div
                        className="bg-brand-green h-4 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="mt-2 text-xl font-bold text-brand-green dark:text-brand-yellow">
                    {unlockedCount} / {totalPlaces}
                </p>
            </section>
            
            <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Modo Oscuro</span>
                    <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;