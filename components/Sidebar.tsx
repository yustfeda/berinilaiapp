import React from 'react';
import type { AppView } from '../types';
import XIcon from './icons/XIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  views: AppView[];
}

const NavLink: React.FC<{
    label: string;
    view: AppView;
    activeView: AppView;
    onClick: () => void;
}> = ({ label, view, activeView, onClick }) => {
    const isActive = activeView === view;
    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={`block px-4 py-3 rounded-md text-lg font-medium transition-colors duration-200 ${
                isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {label}
        </a>
    );
}

const viewToLabelMap: Record<AppView, string> = {
    'participants': 'Kelola Peserta',
    'judges': 'Kelola Juri',
    'scoring': 'Penilaian',
    'score-management': 'Format Penilaian',
    'ranking': 'Rekap Nilai'
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, setActiveView, views }) => {
    
    const handleNavigation = (view: AppView) => {
        setActiveView(view);
        onClose();
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>
            
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Menu</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {views.map(view => (
                        <NavLink 
                            key={view}
                            label={viewToLabelMap[view]} 
                            view={view}
                            activeView={activeView} 
                            onClick={() => handleNavigation(view)} 
                        />
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
