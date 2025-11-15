import React from 'react';
import type { AppView } from '../types';

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  views: AppView[];
  showLogout?: boolean;
  onLogout?: () => void;
}

const NavButton: React.FC<{
  label: string;
  view: AppView;
  activeView: AppView;
  onClick: (view: AppView) => void;
}> = ({ label, view, activeView, onClick }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onClick(view)}
      className={`px-3 py-2 text-sm md:text-base font-medium rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

const viewToLabelMap: Record<AppView, string> = {
    'participants': 'Kelola Peserta',
    'judges': 'Kelola Juri',
    'scoring': 'Penilaian',
    'score-management': 'Format Penilaian',
    'ranking': 'Rekap Nilai'
};

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, views, showLogout, onLogout }) => {
  return (
    <nav className="hidden md:flex items-center space-x-2 md:space-x-4">
      {views.map(view => (
        <NavButton 
            key={view}
            label={viewToLabelMap[view]} 
            view={view} 
            activeView={activeView} 
            onClick={setActiveView} 
        />
      ))}
      {showLogout && (
         <button
            onClick={onLogout}
            className="px-3 py-2 text-sm md:text-base font-medium rounded-md transition-colors duration-200 bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
      )}
    </nav>
  );
};

export default Navbar;
