import React, { useState } from 'react';
import type { Judge } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface JudgeManagerProps {
  judges: Judge[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const JudgeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialName?: string;
}> = ({ isOpen, onClose, onSave, initialName = '' }) => {
    const [name, setName] = useState(initialName);

    React.useEffect(() => {
        setName(initialName);
    }, [initialName, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-4">{initialName ? 'Edit' : 'Tambah'} Juri</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Juri"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex justify-end space-x-3 mt-6">
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


const JudgeManager: React.FC<JudgeManagerProps> = ({
  judges,
  onAdd,
  onUpdate,
  onDelete,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, judgeId: '' });


    const handleOpenAddModal = () => {
        setEditingJudge(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (judge: Judge) => {
        setEditingJudge(judge);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingJudge(null);
    };
    
    const handleSave = (name: string) => {
        if(editingJudge) {
            onUpdate(editingJudge.id, name);
        } else {
            onAdd(name);
        }
    }

    const handleDeleteClick = (judgeId: string) => {
        setConfirmModalState({ isOpen: true, judgeId });
    };

    const handleConfirmDelete = () => {
        onDelete(confirmModalState.judgeId);
        setConfirmModalState({ isOpen: false, judgeId: '' });
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Juri</h2>
            <button onClick={handleOpenAddModal} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                <PlusIcon />
                <span>Tambah Juri</span>
            </button>
        </div>
      
        {judges.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {judges.map(j => (
                        <li key={j.id} className="p-4 flex justify-between items-center">
                            <span className="font-medium text-lg">{j.name}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => handleOpenEditModal(j)} className="p-2 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-md">
                                    <PencilIcon />
                                </button>
                                <button onClick={() => handleDeleteClick(j.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-md">
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada juri. Silakan tambahkan juri baru.</p>
            </div>
        )}
        <JudgeModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            initialName={editingJudge?.name || ''}
        />
        <ConfirmationModal
            isOpen={confirmModalState.isOpen}
            onClose={() => setConfirmModalState({ isOpen: false, judgeId: '' })}
            onConfirm={handleConfirmDelete}
        />
    </div>
  );
};

export default JudgeManager;