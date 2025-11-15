import React, { useState, useMemo } from 'react';
import type { Participant } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (name: string, level: string) => void;
  onUpdate: (id: string, newName: string, newLevel: string) => void;
  onDelete: (id: string) => void;
  levels: string[];
}

const ParticipantModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, level: string) => void;
    initialName?: string;
    initialLevel?: string;
    levels: string[];
}> = ({ isOpen, onClose, onSave, initialName = '', initialLevel = '', levels }) => {
    const [name, setName] = useState(initialName);
    const [level, setLevel] = useState(initialLevel);

    React.useEffect(() => {
        setName(initialName);
        setLevel(initialLevel || (levels.length > 0 ? levels[0] : ''));
    }, [initialName, initialLevel, levels, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && level) {
            onSave(name.trim(), level);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-4">{initialName ? 'Edit' : 'Tambah'} Peserta</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="participant-name" className="block text-sm font-medium mb-1">Nama Peserta</label>
                        <input
                            id="participant-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Peserta"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="level-select" className="block text-sm font-medium mb-1">Jenjang</label>
                        <select
                            id="level-select"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  onAdd,
  onUpdate,
  onDelete,
  levels,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, participantId: '' });

    const filteredParticipants = useMemo(() => {
        if (activeFilter === 'Semua') {
            return participants;
        }
        return participants.filter(p => p.level === activeFilter);
    }, [participants, activeFilter]);

    const handleOpenAddModal = () => {
        setEditingParticipant(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (participant: Participant) => {
        setEditingParticipant(participant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingParticipant(null);
    };
    
    const handleSave = (name: string, level: string) => {
        if(editingParticipant) {
            onUpdate(editingParticipant.id, name, level);
        } else {
            onAdd(name, level);
        }
    }

    const handleDeleteClick = (participantId: string) => {
        setConfirmModalState({ isOpen: true, participantId });
    };

    const handleConfirmDelete = () => {
        onDelete(confirmModalState.participantId);
        setConfirmModalState({ isOpen: false, participantId: '' });
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Peserta</h2>
            <button onClick={handleOpenAddModal} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                <PlusIcon />
                <span>Tambah Peserta</span>
            </button>
        </div>
      
        <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setActiveFilter('Semua')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeFilter === 'Semua' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                Semua
            </button>
            {levels.map(level => (
                <button key={level} onClick={() => setActiveFilter(level)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeFilter === level ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    {level}
                </button>
            ))}
        </div>

        {participants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredParticipants.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col justify-between transition-shadow hover:shadow-xl">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white break-all pr-2">{p.name}</h3>
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-full flex-shrink-0">{p.level}</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 mt-4">
                            <div className="flex space-x-2">
                                <button onClick={() => handleOpenEditModal(p)} className="w-full flex justify-center items-center p-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition-colors">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => handleDeleteClick(p.id)} className="w-full flex justify-center items-center p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada peserta. Silakan tambahkan peserta baru.</p>
            </div>
        )}
        <ParticipantModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            initialName={editingParticipant?.name || ''}
            initialLevel={editingParticipant?.level || ''}
            levels={levels}
        />
        <ConfirmationModal
            isOpen={confirmModalState.isOpen}
            onClose={() => setConfirmModalState({ isOpen: false, participantId: '' })}
            onConfirm={handleConfirmDelete}
        />
    </div>
  );
};

export default ParticipantManager;