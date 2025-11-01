import React from 'react';
import { NavLink } from 'react-router-dom';
// ⚙️ Se actualiza el icono 'Map' por 'LayoutGrid' para reflejar que la página principal ahora es una galería.
import { LayoutGrid, Compass } from 'lucide-react';

// 🧩 Componente de la barra de navegación inferior.
//    Su única responsabilidad (SRP) es mostrar los enlaces de navegación principales
//    y resaltar la ruta activa. Utiliza NavLink de React Router para manejar el estado activo.
const BottomNavBar: React.FC = () => {

    // 🧩 Un SVG inline para el avatar del "granjero", como se pide en el mockup.
    //    Es un componente puramente visual para el ícono de perfil.
    const FarmerIcon = ({ isActive }: { isActive: boolean }) => (
        <div className={`w-8 h-8 rounded-full transition-all duration-200 ${isActive ? 'ring-2 ring-brand-green dark:ring-brand-yellow' : 'ring-1 ring-gray-300 dark:ring-gray-600'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full bg-brand-yellow/20 p-1 text-brand-green dark:text-brand-yellow">
                <path d="M66,74 C66,74 62,80 50,80 C38,80 34,74 34,74 M66,74 L66,66 C66,66 74,58 74,50 C74,42 66,34 66,34 L66,26 C66,26 71,20 62,20 L38,20 C29,20 34,26 34,26 L34,34 C34,34 26,42 26,50 C26,58 34,66 34,66 L34,74 M42,46 C42,46 44,50 50,50 C56,50 58,46 58,46 M42,58 A4,2 0,0,1 58,58 L42,58 M26,50 A24,24 0,0,0 74,50" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );

    const navLinkClasses = ({ isActive }: { isActive: boolean }): string => 
        `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 pt-2 ${
            isActive ? 'text-brand-green dark:text-brand-yellow' : 'text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-yellow'
        }`;

    return (
        // ⚙️ Rediseño: Se elimina el borde superior y se añade una sombra para un efecto flotante.
        //    La estructura ahora es un flexbox con 3 items para acomodar el FAB en el centro.
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-white/90 dark:bg-gray-950/90 backdrop-blur-lg z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.2)]">
            <div className="flex justify-around items-center h-full max-w-md mx-auto">
                <NavLink to="/" className={navLinkClasses} end>
                    {({ isActive }) => (
                        <>
                            {/* 💡 El ícono y texto se actualizan para reflejar la nueva vista de galería. */}
                            <LayoutGrid size={24} />
                            <span className={`text-xs font-semibold`}>Explorar</span>
                        </>
                    )}
                </NavLink>

                {/* 💡 Botón de Acción Flotante (FAB): El elemento central y principal.
                    Se eleva con un transform y una sombra, y tiene un estado activo distintivo. */}
                <NavLink 
                    to="/navigate" 
                    aria-label="Iniciar navegación"
                    className={({ isActive }) => 
                        `w-16 h-16 bg-brand-green rounded-full shadow-lg flex items-center justify-center text-white
                         transform transition-all duration-300 ease-in-out hover:scale-110 -translate-y-6
                         ${isActive ? 'ring-4 ring-offset-4 ring-offset-brand-white dark:ring-offset-gray-950 ring-brand-yellow' : ''}`
                    }
                >
                    <Compass size={32} />
                </NavLink>

                <NavLink to="/profile" className={navLinkClasses}>
                    {({ isActive }) => (
                        <>
                           <FarmerIcon isActive={isActive} />
                           <span className={`text-xs font-semibold`}>Perfil</span>
                        </>
                    )}
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNavBar;
