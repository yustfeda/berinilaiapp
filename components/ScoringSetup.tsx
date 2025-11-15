import React, { useState, useMemo } from 'react';
import type { Participant, Judge } from '../types';

interface ScoringSetupProps {
  participants: Participant[];
  judges: Judge[];
  onStartScoring: (participantId: string, judgeId: string) => void;
  levels: string[];
}

const ScoringSetup: React.FC<ScoringSetupProps> = ({ participants, judges, onStartScoring, levels }) => {
    const [selectedLevel, setSelectedLevel] = useState<string>(levels[0] || '');
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
    const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

    const filteredParticipants = useMemo(() => {
        return participants.filter(p => p.level === selectedLevel);
    }, [participants, selectedLevel]);
    
    React.useEffect(() => {
        setSelectedParticipantId(filteredParticipants[0]?.id || '');
    }, [filteredParticipants]);

    React.useEffect(() => {
        if (judges.length > 0) {
            setSelectedJudgeId(judges[0].id);
        }
    }, [judges]);

    const canStart = selectedParticipantId && selectedJudgeId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canStart) {
            onStartScoring(selectedParticipantId, selectedJudgeId);
        }
    }

    const hasPrerequisites = participants.length > 0 && judges.length > 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mulai Penilaian</h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
                {!hasPrerequisites ? (
                     <div className="text-center py-10 px-6">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {participants.length === 0 && 'Harap tambah peserta terlebih dahulu. '}
                            {judges.length === 0 && 'Harap tambah juri terlebih dahulu.'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                             <label htmlFor="level-select-scoring" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Jenjang</label>
                             <select 
                                id="level-select-scoring" 
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {levels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        {filteredParticipants.length > 0 ? (
                           <>
                                <div>
                                    <label htmlFor="participant-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Peserta</label>
                                    <select 
                                        id="participant-select" 
                                        value={selectedParticipantId}
                                        onChange={(e) => setSelectedParticipantId(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {filteredParticipants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="judge-select" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Juri</label>
                                    <select 
                                        id="judge-select"
                                        value={selectedJudgeId}
                                        onChange={(e) => setSelectedJudgeId(e.target.value)}
                                        className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                    </select>
                                </div>
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={!canStart}
                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold text-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Mulai Menilai
                                    </button>
                                </div>
                           </>
                        ) : (
                            <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-gray-500 dark:text-gray-400">Tidak ada peserta untuk jenjang {selectedLevel}.</p>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
};

export default ScoringSetup;