export interface Criterion {
  id: number;
  name: string;
  scores: { [performanceLevelId: string]: number[] };
}

export interface Category {
  id: number;
  name: string;
  criteria: Criterion[];
}

export interface Scores {
  [criterionId: number]: number;
}

export interface Judge {
  id: string;
  name: string;
}

export interface Participant {
  id:string;
  name: string;
  level: string;
  scores: { [judgeId: string]: Scores };
}

export interface PerformanceLevel {
    id: string;
    name: string;
    color: string;
    textColor: string;
}

export type AppView = 'participants' | 'judges' | 'scoring' | 'ranking' | 'score-management';