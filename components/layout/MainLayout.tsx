import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

// 💡 Este componente 'MainLayout' aplica el principio Open/Closed (OCP).
//    Está "cerrado" a la modificación (su estructura de layout es fija), pero "abierto"
//    a la extensión, ya que puede renderizar cualquier página que se le pase a través del
//    componente 'Outlet' de React Router.
const MainLayout: React.FC = () => {
    return (
        // ⚙️ Se ajusta el layout para que el padding-bottom se aplique al área de contenido principal.
        //    Esto asegura que en todas las páginas, el contenido finalice justo por encima de la
        //    barra de navegación, evitando superposiciones. 'relative' es clave para contener
        //    elementos 'absolute' de las páginas hijas.
        <div className="h-full w-full">
            <main className="relative h-full w-full overflow-y-auto pb-20">
                <Outlet />
            </main>
            <BottomNavBar />
        </div>
    );
};

export default MainLayout;