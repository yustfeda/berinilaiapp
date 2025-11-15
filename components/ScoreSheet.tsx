
import React from 'react';
import type { Participant, Category, PerformanceLevel, Judge } from '../types';

interface ScoreSheetProps {
  participant: Participant;
  judge: Judge;
  onScoreChange: (participantId: string, judgeId: string, criterionId: number, score: number) => void;
  onClose: () => void;
  categories: Category[];
  performanceLevels: PerformanceLevel[];
}

const ScoreSheet: React.FC<ScoreSheetProps> = ({ participant, judge, onScoreChange, onClose, categories, performanceLevels }) => {
    const totalScore = React.useMemo(() => {
        const judgeScores = participant.scores[judge.id] || {};
        return Object.values(judgeScores).reduce((sum: number, score: number) => sum + score, 0);
    }, [participant.scores, judge.id]);
    
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Formulir Penilaian: {participant.name}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">Dinilai oleh: <span className="font-semibold">{judge.name}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase">
            <tr>
              <th rowSpan={2} className="px-2 py-3 text-center align-middle border-b border-r dark:border-gray-600 whitespace-nowrap">No</th>
              <th rowSpan={2} className="px-3 py-3 text-left align-middle border-b border-r dark:border-gray-600 whitespace-nowrap">Kriteria Penilaian</th>
              <th colSpan={performanceLevels.length} className="px-3 py-2 text-center text-xs font-bold border-b dark:border-gray-600 whitespace-nowrap">Jenjang Performa</th>
            </tr>
             <tr>
              {performanceLevels.map(level => (
                <th key={level.id} className={`px-3 py-2 text-center font-semibold border-b border-r last:border-r-0 dark:border-gray-600 whitespace-nowrap ${level.color} ${level.textColor}`}>
                  {level.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {categories.map(category => (
                <React.Fragment key={category.id}>
                    <tr>
                        <td colSpan={2 + performanceLevels.length} className="px-3 py-2 font-semibold bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 whitespace-nowrap">
                            {category.name}
                        </td>
                    </tr>
                    {category.criteria.map(criterion => (
                        <tr key={criterion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-2 py-2 text-center border-r dark:border-gray-600">{criterion.id}</td>
                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white border-r dark:border-gray-600 whitespace-nowrap">{criterion.name}</td>
                            {performanceLevels.map(level => {
                                const scoresForLevel = criterion.scores[level.id] || [];
                                return (
                                    <td key={level.id} className="text-center align-middle p-1 border-r last:border-r-0 dark:border-gray-600">
                                        <div className="flex items-center justify-center gap-1">
                                            {scoresForLevel.map(score => {
                                                const currentJudgeScores = participant.scores[judge.id] || {};
                                                const isSelected = currentJudgeScores[criterion.id] === score;
                                                return (
                                                    <button 
                                                        key={score}
                                                        onClick={() => onScoreChange(participant.id, judge.id, criterion.id, score)}
                                                        className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-xs font-mono transition-all duration-200 ${
                                                            isSelected ? 'bg-teal-500 text-white font-bold scale-110 shadow-lg' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {score}
                                                    </button>
                                                )
                                            })}
                                            {scoresForLevel.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
        <div className="flex items-baseline mb-4 md:mb-0">
            <span className="text-lg font-bold uppercase text-gray-600 dark:text-gray-300 mr-4">Total Skor:</span>
            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{totalScore}</span>
        </div>
        <button onClick={onClose} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold">
          Simpan & Tutup
        </button>
      </div>
    </div>
  );
};

export default ScoreSheet;