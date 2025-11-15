import React, { useState, useEffect } from 'react';
import type { Category, PerformanceLevel, Criterion } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import XIcon from './icons/XIcon';
import ConfirmationModal from './ConfirmationModal';

interface ScoreManagerProps {
  categoriesByLevel: { [key: string]: Category[] };
  onAddCriterion: (level: string, categoryId: number, newCriterion: Omit<Criterion, 'id'>) => void;
  onUpdateCriterion: (level: string, categoryId: number, updatedCriterion: Criterion) => void;
  onDeleteCriterion: (level: string, categoryId: number, criterionId: number) => void;
  performanceLevels: PerformanceLevel[];
  onAddPerformanceLevel: (level: Omit<PerformanceLevel, 'id'>) => void;
  onUpdatePerformanceLevel: (level: PerformanceLevel) => void;
  onDeletePerformanceLevel: (levelId: string) => void;
  levels: string[];
}

const CriterionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (criterion: Omit<Criterion, 'id'> | Criterion) => void;
    initialCriterion?: Criterion;
    performanceLevels: PerformanceLevel[];
}> = ({ isOpen, onClose, onSave, initialCriterion, performanceLevels }) => {
    const [name, setName] = useState('');
    const [scores, setScores] = useState<{[levelId: string]: string}>({});

    useEffect(() => {
        if (isOpen) {
            setName(initialCriterion?.name || '');
            const initialScores: {[levelId: string]: string} = {};
            performanceLevels.forEach(level => {
                initialScores[level.id] = initialCriterion?.scores[level.id]?.join(', ') || '';
            });
            setScores(initialScores);
        }
    }, [initialCriterion, performanceLevels, isOpen]);

    if (!isOpen) return null;

    const handleScoreChange = (levelId: string, value: string) => {
        setScores(prev => ({ ...prev, [levelId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const parsedScores: { [levelId: string]: number[] } = {};
        for (const levelId in scores) {
            parsedScores[levelId] = scores[levelId].split(',')
                .map(s => parseInt(s.trim(), 10))
                .filter(n => !isNaN(n))
                .sort((a,b) => a - b);
        }

        const criterionData = { name: name.trim(), scores: parsedScores };
        if (initialCriterion) {
            onSave({ ...criterionData, id: initialCriterion.id });
        } else {
            onSave(criterionData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
                    <h2 className="text-xl font-bold">{initialCriterion ? 'Edit' : 'Tambah'} Kriteria</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Kriteria</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sikap Sempurna" className="w-full input-style" required />
                        </div>
                        <h3 className="text-md font-semibold pt-2 border-t dark:border-gray-600">Nilai per Jenjang Performa</h3>
                        {performanceLevels.map(level => (
                            <div key={level.id}>
                                <label className="block text-sm font-medium mb-1">
                                    Nilai untuk <span className={`font-bold ${level.textColor.includes('white') ? level.color : ''} p-1 rounded`}>{level.name}</span> (pisahkan koma)
                                </label>
                                <input 
                                    type="text" 
                                    value={scores[level.id] || ''} 
                                    onChange={(e) => handleScoreChange(level.id, e.target.value)} 
                                    placeholder="e.g., 40, 45, 50" 
                                    className="w-full input-style"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
            <style>{`.input-style { padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; } .dark .input-style { background-color: #374151; border-color: #4B5563; }`}</style>
        </div>
    );
};

const PerformanceLevelModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (level: PerformanceLevel | Omit<PerformanceLevel, 'id'>) => void;
    initialLevel?: PerformanceLevel;
}> = ({ isOpen, onClose, onSave, initialLevel }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('bg-gray-500');
    const [textColor, setTextColor] = useState('text-white');

    useEffect(() => {
        if (isOpen) {
            setName(initialLevel?.name || '');
            setColor(initialLevel?.color || 'bg-gray-500');
            setTextColor(initialLevel?.textColor || 'text-white');
        }
    }, [initialLevel, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            const levelData = { name: name.trim(), color, textColor };
            if (initialLevel) {
                onSave({ ...levelData, id: initialLevel.id });
            } else {
                onSave(levelData);
            }
            onClose();
        }
    };
    
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-600', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold mb-4">{initialLevel ? 'Edit' : 'Tambah'} Jenjang Performa</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Jenjang</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Cukup, Baik" className="w-full input-style" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Warna Latar</label>
                        <select value={color} onChange={e => setColor(e.target.value)} className="w-full input-style">
                            {colors.map(c => <option key={c} value={c}>{c.replace('bg-', '').replace('-500','').replace('-600','')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Warna Teks</label>
                        <select value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full input-style">
                            <option value="text-white">Putih</option>
                            <option value="text-black">Hitam</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Simpan</button>
                    </div>
                </form>
            </div>
             <style>{`.input-style { padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; } .dark .input-style { background-color: #374151; border-color: #4B5563; }`}</style>
        </div>
    );
}

const ScoreManager: React.FC<ScoreManagerProps> = ({
  categoriesByLevel,
  onAddCriterion,
  onUpdateCriterion,
  onDeleteCriterion,
  performanceLevels,
  onAddPerformanceLevel,
  onUpdatePerformanceLevel,
  onDeletePerformanceLevel,
  levels
}) => {
    const [selectedLevel, setSelectedLevel] = useState(levels[0] || '');
    const [criterionModalState, setCriterionModalState] = useState<{
        isOpen: boolean;
        categoryId: number | null;
        initialCriterion?: Criterion;
    }>({ isOpen: false, categoryId: null });
    
    const [levelModalState, setLevelModalState] = useState<{
        isOpen: boolean;
        initialLevel?: PerformanceLevel;
    }>({ isOpen: false });

    const [confirmDeleteState, setConfirmDeleteState] = useState<{
        isOpen: boolean;
        type: 'criterion' | 'level' | null;
        ids: { categoryId?: number, criterionId?: number, levelId?: string };
    }>({ isOpen: false, type: null, ids: {} });
    
    const handleCloseCriterionModal = () => setCriterionModalState({ isOpen: false, categoryId: null });
    const handleCloseLevelModal = () => setLevelModalState({ isOpen: false });
    
    const handleSaveCriterion = (criterion: Omit<Criterion, 'id'> | Criterion) => {
        const { categoryId } = criterionModalState;
        if (categoryId === null) return;

        if ('id' in criterion) {
            onUpdateCriterion(selectedLevel, categoryId, criterion);
        } else {
            onAddCriterion(selectedLevel, categoryId, criterion);
        }
        handleCloseCriterionModal();
    }
    
    const handleSaveLevel = (level: PerformanceLevel | Omit<PerformanceLevel, 'id'>) => {
        if ('id' in level) {
            onUpdatePerformanceLevel(level);
        } else {
            onAddPerformanceLevel(level);
        }
    }

    const handleDeleteCriterionClick = (categoryId: number, criterionId: number) => {
        setConfirmDeleteState({ isOpen: true, type: 'criterion', ids: { categoryId, criterionId } });
    };
    
    const handleDeleteLevelClick = (levelId: string) => {
        setConfirmDeleteState({ isOpen: true, type: 'level', ids: { levelId } });
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteState.type === 'criterion' && confirmDeleteState.ids.categoryId && confirmDeleteState.ids.criterionId) {
            onDeleteCriterion(selectedLevel, confirmDeleteState.ids.categoryId, confirmDeleteState.ids.criterionId);
        } else if (confirmDeleteState.type === 'level' && confirmDeleteState.ids.levelId) {
            onDeletePerformanceLevel(confirmDeleteState.ids.levelId);
        }
        setConfirmDeleteState({ isOpen: false, type: null, ids: {} });
    };

    const categories = categoriesByLevel[selectedLevel] || [];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Kelola Format Penilaian</h2>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Pilih Jenjang</h3>
                <div className="flex flex-wrap gap-2">
                    {levels.map(level => (
                        <button key={level} onClick={() => setSelectedLevel(level)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="p-4 border-b dark:border-gray-600">
                         <h3 className="text-xl font-semibold">Jenjang Performa</h3>
                    </div>
                    <div className="p-4 space-y-3">
                    {performanceLevels.map(level => (
                        <div key={level.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${level.color} ${level.textColor}`}>{level.name}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => setLevelModalState({ isOpen: true, initialLevel: level })} className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 dark:hover:bg-gray-600" aria-label={`Edit level ${level.name}`}><PencilIcon /></button>
                                <button onClick={() => handleDeleteLevelClick(level.id)} className="p-2 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-gray-600" aria-label={`Delete level ${level.name}`}><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600">
                         <button onClick={() => setLevelModalState({ isOpen: true })} className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                             <PlusIcon />
                             <span>Tambah Jenjang Performa</span>
                         </button>
                     </div>
                </div>
            </div>

            {categories.map(category => (
                <div key={`${selectedLevel}-${category.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-600">
                         <h3 className="text-xl font-semibold">{category.name}</h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                        {category.criteria.map(criterion => (
                            <li key={criterion.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <span>{criterion.name}</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCriterionModalState({ isOpen: true, categoryId: category.id, initialCriterion: criterion })}
                                        className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 dark:hover:bg-gray-600"
                                        aria-label={`Edit criterion ${criterion.name}`}
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCriterionClick(category.id, criterion.id)}
                                        className="p-2 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-gray-600"
                                        aria-label={`Delete criterion ${criterion.name}`}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                         {category.criteria.length === 0 && (
                            <li className="p-4 text-center text-gray-500 dark:text-gray-400">Tidak ada kriteria untuk jenjang ini.</li>
                        )}
                    </ul>
                     <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
                         <button 
                             onClick={() => setCriterionModalState({ isOpen: true, categoryId: category.id })}
                             className="flex items-center space-x-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                         >
                             <PlusIcon />
                             <span>Tambah Kriteria Penilaian</span>
                         </button>
                     </div>
                </div>
            ))}
            
            <CriterionModal 
                isOpen={criterionModalState.isOpen}
                onClose={handleCloseCriterionModal}
                onSave={handleSaveCriterion}
                initialCriterion={criterionModalState.initialCriterion}
                performanceLevels={performanceLevels}
            />

            <PerformanceLevelModal 
                isOpen={levelModalState.isOpen}
                onClose={handleCloseLevelModal}
                onSave={handleSaveLevel}
                initialLevel={levelModalState.initialLevel}
            />
            <ConfirmationModal
                isOpen={confirmDeleteState.isOpen}
                onClose={() => setConfirmDeleteState({ isOpen: false, type: null, ids: {} })}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default ScoreManager;