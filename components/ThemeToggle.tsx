import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

// FIX: Workaround for a TypeScript error where framer-motion props are not recognized.
const MotionDiv = motion.div as any;

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
      <MotionDiv
        key={isDarkMode ? 'moon' : 'sun'}
        initial={{ y: -20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} className="text-brand-green" />}
      </MotionDiv>
    </button>
  );
};

export default ThemeToggle;
