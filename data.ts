import type { Category, PerformanceLevel } from './types';

export const INITIAL_PERFORMANCE_LEVELS: PerformanceLevel[] = [
  { id: 'level-1', name: 'CUKUP', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'level-2', name: 'BAIK', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 'level-3', name: 'BAIK SEKALI', color: 'bg-green-600', textColor: 'text-white' },
];

const defaultScores = {
    'level-1': [40, 45, 50],
    'level-2': [60, 65, 70],
    'level-3': [75, 80, 85]
};

const commonCriteria = [
    { id: 1, name: 'Sikap Sempurna', scores: { ...defaultScores } },
    { id: 2, name: 'Hormat', scores: { ...defaultScores } },
    { id: 3, name: 'Istirahat Ditempat', scores: { ...defaultScores } },
    { id: 4, name: 'Periksa Kerapihan', scores: { ...defaultScores } },
    { id: 5, name: 'Hitung', scores: { ...defaultScores } },
    { id: 6, name: 'Setengah Lengan Lencang Kanan', scores: { ...defaultScores } },
    { id: 7, name: 'Lencang Kanan', scores: { ...defaultScores } },
    { id: 8, name: 'Hadap Kanan', scores: { ...defaultScores } },
    { id: 9, name: 'Hadap Kiri', scores: { ...defaultScores } },
    { id: 10, name: 'Balik Kanan', scores: { ...defaultScores } },
    { id: 11, name: 'Jalan Ditempat', scores: { ...defaultScores } },
    { id: 12, name: 'Balik Kanan', scores: { ...defaultScores } },
    { id: 18, name: '4 langkah ke kanan', scores: { ...defaultScores } },
    { id: 19, name: '4 langkah ke kiri', scores: { ...defaultScores } },
    { id: 20, name: '3 langkah ke belakang', scores: { ...defaultScores } },
    { id: 21, name: '2 langkah ke depan', scores: { ...defaultScores } },
    { id: 22, name: 'Bubar', scores: { ...defaultScores } },
];

// To keep data consistent but allow for future changes, we duplicate the structure for each level.
export const INITIAL_CATEGORIES_BY_LEVEL: { [key: string]: Category[] } = {
  'SD': [
    { id: 1, name: 'Kriteria Penilaian PBB - SD', criteria: JSON.parse(JSON.stringify(commonCriteria)) }
  ],
  'SMP': [
    { id: 1, name: 'Kriteria Penilaian PBB - SMP', criteria: JSON.parse(JSON.stringify(commonCriteria)) }
  ],
  'SLTA': [
    { id: 1, name: 'Kriteria Penilaian PBB - SLTA', criteria: JSON.parse(JSON.stringify(commonCriteria)) }
  ],
};