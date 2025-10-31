import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 🧩 Componente con Responsabilidad Única (SRP): su única tarea es cambiar el tema.
//    Se ha hecho más reutilizable al eliminar el posicionamiento absoluto, permitiendo
//    que el componente padre decida dónde colocarlo.
const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 shadow-inner transition-colors"
    >
      <motion.div
        key={isDarkMode ? 'moon' : 'sun'}
        initial={{ y: -20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} className="text-brand-green" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;