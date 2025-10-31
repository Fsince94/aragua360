import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

// 💡 Este componente 'MainLayout' aplica el principio Open/Closed (OCP).
//    Está "cerrado" a la modificación (su estructura de layout es fija), pero "abierto"
//    a la extensión, ya que puede renderizar cualquier página que se le pase a través del
//    componente 'Outlet' de React Router.
const MainLayout: React.FC = () => {
    return (
        // El padding-bottom (pb-20) evita que el contenido de la página quede oculto detrás de la barra de navegación fija.
        <div className="h-full w-full pb-20">
            <main className="h-full w-full overflow-y-auto">
                <Outlet />
            </main>
            <BottomNavBar />
        </div>
    );
};

export default MainLayout;
