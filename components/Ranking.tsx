import React from 'react';
import type { Participant, Judge, Category, Criterion } from '../types';

interface RankingProps {
  participants: Participant[];
  judges: Judge[];
  categoriesByLevel: { [key: string]: Category[] };
  levels: string[];
}

const Ranking: React.FC<RankingProps> = ({ participants, judges, categoriesByLevel, levels }) => {
  const [selectedLevel, setSelectedLevel] = React.useState('Semua');

  const criteriaForHeader = React.useMemo(() => {
    if (selectedLevel === 'Semua' || !categoriesByLevel[selectedLevel]) {
      return [];
    }
    return (categoriesByLevel[selectedLevel] || []).flatMap(c => c.criteria).sort((a, b) => a.id - b.id);
  }, [categoriesByLevel, selectedLevel]);

  const calculateAndRank = (participantsToRank: Participant[]) => {
      const participantsWithScores = participantsToRank.map(p => {
        const criterionTotals: { [criterionId: number]: number } = {};
        const judgeTotals: { [judgeId: string]: number } = {};
        const criteriaForParticipant = (categoriesByLevel[p.level] || []).flatMap(c => c.criteria);

        judges.forEach(j => { judgeTotals[j.id] = 0; });

        criteriaForParticipant.forEach(criterion => {
            let criterionTotalForParticipant = 0;
            judges.forEach(judge => {
                const score = p.scores[judge.id]?.[criterion.id] || 0;
                criterionTotalForParticipant += score;
                judgeTotals[judge.id] += score;
            });
            criterionTotals[criterion.id] = criterionTotalForParticipant;
        });

        const totalScore = Object.values(judgeTotals).reduce((sum, score) => sum + score, 0);

        return { ...p, totalScore, criterionTotals, judgeTotals };
    });
      
    const sortedParticipants = [...participantsWithScores].sort((a, b) => b.totalScore - a.totalScore);
      
    let lastTotalScore = -1;
    let currentFinalRank = 0;
    return sortedParticipants.map((p, index) => {
        if (p.totalScore !== lastTotalScore) {
            currentFinalRank = index + 1;
            lastTotalScore = p.totalScore;
        }
        return { ...p, finalRank: currentFinalRank };
    });
  };

  const rankedParticipants = React.useMemo(() => {
    const filteredParticipants = selectedLevel === 'Semua' 
      ? participants 
      : participants.filter(p => p.level === selectedLevel);
    
    return calculateAndRank(filteredParticipants);
      
  }, [participants, judges, categoriesByLevel, selectedLevel]);

  const generateSingleTableHtml = (rankedData: any[], title: string, localJudges: Judge[], localAllCriteria: Criterion[]) => {
      let tableHtml = title ? `<h2>${title}</h2>` : '';

      // Table Header
      tableHtml += `<table><thead>`;
      // Row 1
      tableHtml += `<tr>`;
      tableHtml += `<th rowSpan="2" class="rank">PERINGKAT</th>`;
      tableHtml += `<th rowSpan="2" class="participant-name">NAMA PESERTA</th>`;
      localAllCriteria.forEach(criterion => {
          tableHtml += `<th class="criterion-header" colSpan="${localJudges.length + 1}">${criterion.name.toUpperCase()}</th>`;
      });
      localJudges.forEach(judge => {
          tableHtml += `<th rowSpan="2" class="judge-total-header">TOTAL ${judge.name.toUpperCase()}</th>`;
      });
      tableHtml += `<th rowSpan="2" class="final-total">TOTAL NILAI</th>`;
      tableHtml += `</tr>`;
      // Row 2
      tableHtml += `<tr>`;
      localAllCriteria.forEach(() => {
          localJudges.forEach(judge => {
              tableHtml += `<th class="judge-header">${judge.name}</th>`;
          });
          tableHtml += `<th class="judge-header bold">Total</th>`;
      });
      tableHtml += `</tr>`;
      tableHtml += `</thead>`;
  
      // Table Body
      tableHtml += `<tbody>`;
      rankedData.forEach((p: any) => {
        tableHtml += `<tr>`;
        tableHtml += `<td class="rank">${p.finalRank}</td>`;
        tableHtml += `<td class="participant-name">${p.name}</td>`;
        localAllCriteria.forEach(criterion => {
          localJudges.forEach(judge => {
              const score = p.scores[judge.id]?.[criterion.id] || 0;
              tableHtml += `<td>${score}</td>`;
          });
          tableHtml += `<td class="criterion-total">${p.criterionTotals[criterion.id] || 0}</td>`;
        });
        localJudges.forEach(judge => {
          tableHtml += `<td class="judge-total">${p.judgeTotals[judge.id] || 0}</td>`;
        });
        tableHtml += `<td class="final-total">${p.totalScore}</td>`;
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table>`;
      return tableHtml;
  };

  const handleDownloadPdf = () => {
    const styles = `
      @page { size: legal landscape; margin: 15px; }
      body { font-family: Arial, sans-serif; font-size: 8px; }
      h1, h2 { text-align: center; margin-bottom: 1rem; }
      h1 { font-size: 16px; }
      h2 { font-size: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; }
      thead { background-color: #f2f2f2; }
      th { font-weight: bold; }
      .criterion-header { background-color: #FFDAB9; }
      .judge-header { background-color: #E6E6FA; }
      .judge-total-header { background-color: #ADD8E6; }
      .participant-name { text-align: left; white-space: nowrap; font-weight: bold; }
      tbody tr:nth-child(even) { background-color: #f9f9f9; }
      b, .bold { font-weight: bold; }
      .criterion-total, .final-total, .rank, .judge-total { font-weight: bold; }
      .judge-total { background-color: #f0f8ff; }
      .page-break { page-break-before: always; }
    `;

    let mainTitle = 'Rekapitulasi Rinci Nilai PBB';
    let bodyContent = '';

    if (selectedLevel !== 'Semua') {
      mainTitle += ` - Jenjang ${selectedLevel}`;
      const filteredParticipants = participants.filter(p => p.level === selectedLevel);
      if (filteredParticipants.length > 0) {
        const rankedData = calculateAndRank(filteredParticipants);
        const criteriaForPdf = (categoriesByLevel[selectedLevel] || []).flatMap(c => c.criteria);
        bodyContent = generateSingleTableHtml(rankedData, '', judges, criteriaForPdf);
      } else {
        bodyContent = `<p style="text-align: center;">Tidak ada data untuk jenjang ${selectedLevel}.</p>`;
      }
    } else {
      mainTitle += ' - Semua Jenjang';
      const htmlParts: string[] = [];
      levels.forEach(level => {
        const filteredParticipants = participants.filter(p => p.level === level);
        if (filteredParticipants.length > 0) {
          const rankedData = calculateAndRank(filteredParticipants);
          const criteriaForPdf = (categoriesByLevel[level] || []).flatMap(c => c.criteria);
          htmlParts.push(generateSingleTableHtml(rankedData, `Jenjang ${level}`, judges, criteriaForPdf));
        }
      });
      bodyContent = htmlParts.join('<div class="page-break"></div>');
    }

    const fullHtml = `
      <!DOCTYPE html><html><head><title>${mainTitle}</title><style>${styles}</style></head>
      <body><h1>${mainTitle}</h1>${bodyContent}</body></html>
    `;
    
    const printWindow = window.open('', '_blank');
    if(printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 1000);
    }
  };

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rekapitulasi Nilai</h2>
                <button onClick={handleDownloadPdf} className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                    Unduh Rekap (PDF)
                </button>
            </div>

            <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Filter Jenjang</h3>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedLevel('Semua')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${selectedLevel === 'Semua' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        Semua
                    </button>
                    {levels.map(level => (
                        <button key={level} onClick={() => setSelectedLevel(level)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th rowSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-center align-middle sticky left-0 bg-gray-50 dark:bg-gray-700 z-20 border-b border-r dark:border-gray-600">Peringkat</th>
                            <th rowSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider align-middle sticky bg-gray-50 dark:bg-gray-700 z-20 border-b border-r dark:border-gray-600" style={{left: '80px'}}>Nama Peserta</th>
                            {criteriaForHeader.map(criterion => (
                                <th key={criterion.id} colSpan={judges.length + 1} className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-l dark:border-gray-600 whitespace-nowrap bg-yellow-100 dark:bg-yellow-900/50">
                                    {criterion.name}
                                </th>
                            ))}
                            {judges.map(judge => (
                                <th key={`total-judge-header-${judge.id}`} rowSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-center align-middle border-b border-l dark:border-gray-600 whitespace-nowrap bg-blue-100 dark:bg-blue-900/50">
                                    Total {judge.name}
                                </th>
                            ))}
                            <th rowSpan={2} className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right align-middle border-b border-l dark:border-gray-600 sticky right-0 bg-gray-50 dark:bg-gray-700 z-20">Total Nilai</th>
                        </tr>
                        <tr>
                            {criteriaForHeader.map(criterion => (
                                <React.Fragment key={`${criterion.id}-judges`}>
                                    {judges.map(judge => (
                                        <th key={judge.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-l dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 whitespace-nowrap">{judge.name}</th>
                                    ))}
                                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-600 dark:text-gray-200 uppercase tracking-wider border-b border-l border-r dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 whitespace-nowrap">Total</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {rankedParticipants.length > 0 ? (
                            rankedParticipants.map((p: any) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white text-lg text-center sticky left-0 bg-white dark:bg-gray-800 z-10 border-r dark:border-gray-600">{p.finalRank}</td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white sticky bg-white dark:bg-gray-800 z-10 border-r dark:border-gray-600" style={{left: '80px'}}>{p.name} ({p.level})</td>
                                    {criteriaForHeader.map(criterion => (
                                       <React.Fragment key={`${p.id}-${criterion.id}`}>
                                            {judges.map(judge => (
                                                <td key={judge.id} className="px-3 py-4 whitespace-nowrap text-center border-l dark:border-gray-600 text-sm">
                                                    {p.scores[judge.id]?.[criterion.id] || 0}
                                                </td>
                                            ))}
                                            <td className="px-3 py-4 whitespace-nowrap text-center font-bold border-l border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm">
                                                {p.criterionTotals[criterion.id] || 0}
                                            </td>
                                       </React.Fragment>
                                    ))}
                                    {judges.map(judge => (
                                        <td key={`total-judge-cell-${p.id}-${judge.id}`} className="px-4 py-4 whitespace-nowrap text-center font-bold border-l dark:border-gray-600 bg-blue-50 dark:bg-blue-900/40 text-sm">
                                            {p.judgeTotals[judge.id] || 0}
                                        </td>
                                    ))}
                                    <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-lg text-blue-600 dark:text-blue-400 border-l dark:border-gray-600 sticky right-0 bg-white dark:bg-gray-800 z-10">
                                        {p.totalScore}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2 + criteriaForHeader.length * (judges.length + 1) + judges.length + 1} className="text-center py-10 px-6 text-gray-500 dark:text-gray-400">
                                    Tidak ada data untuk ditampilkan pada jenjang yang dipilih.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Ranking;