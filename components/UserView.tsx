import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Participant, AppView, Judge } from '../types';
import Navbar from './Navbar';
import Ranking from './Ranking';
import ScoreSheet from './ScoreSheet';
import ScoringSetup from './ScoringSetup';
import Sidebar from './Sidebar';
import AnimatedHamburgerIcon from './icons/AnimatedHamburgerIcon';

export const LEVELS = ['SD', 'SMP', 'SLTA'];

interface UserViewProps {
    data: any; // The whole object from useSyncData
}

const UserView: React.FC<UserViewProps> = ({ data }) => {
  const { isLoading, participants, judges, categoriesByLevel, performanceLevels, handlers } = data;
  const [activeView, setActiveView] = useState<AppView>('scoring');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scoringState, setScoringState] = useState<{ participant: Participant; judge: Judge } | null>(null);

  const { handleScoreChange } = handlers;
  
  const handleStartScoring = useCallback((participantId: string, judgeId: string) => {
      const participant = participants.find((p: Participant) => p.id === participantId);
      const judge = judges.find((j: Judge) => j.id === judgeId);
      if (participant && judge) {
          setScoringState({ participant, judge });
      }
  }, [participants, judges]);
  
  const handleEndScoring = () => {
      setScoringState(null);
  };
  
  // Keep participant in scoringState in sync
  useEffect(() => {
    if (scoringState) {
        const updatedParticipant = participants.find((p: Participant) => p.id === scoringState.participant.id);
        if (updatedParticipant) {
            setScoringState(prev => prev ? {...prev, participant: updatedParticipant} : null);
        }
    }
  }, [participants, scoringState]);


  const categoriesForSheet = useMemo(() => (
    scoringState ? categoriesByLevel[scoringState.participant.level] || [] : []
  ), [scoringState, categoriesByLevel]);

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">Loading Data...</div>;
  }
  
  const renderContent = () => {
    if (scoringState) {
      return (
        <ScoreSheet
          participant={scoringState.participant}
          judge={scoringState.judge}
          onScoreChange={handleScoreChange}
          onClose={handleEndScoring}
          categories={categoriesForSheet}
          performanceLevels={performanceLevels}
        />
      );
    }

    switch (activeView) {
      case 'scoring':
        return (
          <ScoringSetup 
            participants={participants}
            judges={judges}
            onStartScoring={handleStartScoring}
            levels={LEVELS}
          />
        );
      case 'ranking':
        return <Ranking participants={participants} judges={judges} categoriesByLevel={categoriesByLevel} levels={LEVELS} />;
      default:
        // Redirect to a valid view if somehow an invalid one is set
        if (activeView !== 'scoring') setActiveView('scoring');
        return null;
    }
  };
  
  const userViews: AppView[] = ['scoring', 'ranking'];

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeView={activeView}
        setActiveView={setActiveView}
        views={userViews}
      />
       {/* Mobile navigation button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 shadow-lg"
          aria-label="Toggle menu"
        >
          <AnimatedHamburgerIcon isOpen={isSidebarOpen} />
        </button>
      </div>

      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aplikasi Penilaian PBB</h1>
          <Navbar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            views={userViews}
          />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default UserView;
