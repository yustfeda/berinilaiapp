import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import type { Participant, Judge, Category, PerformanceLevel, Criterion, Scores } from '../types';
import { INITIAL_CATEGORIES_BY_LEVEL, INITIAL_PERFORMANCE_LEVELS } from '../data';

// Helper to convert Firebase object to array
const firebaseObjectToArray = <T>(obj: Record<string, T> | undefined | null): T[] => {
    if (!obj) return [];
    return Object.values(obj);
};

export const useSyncData = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [judges, setJudges] = useState<Judge[]>([]);
    const [categoriesByLevel, setCategoriesByLevel] = useState<{ [key: string]: Category[] }>(INITIAL_CATEGORIES_BY_LEVEL);
    const [performanceLevels, setPerformanceLevels] = useState<PerformanceLevel[]>(INITIAL_PERFORMANCE_LEVELS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const participantsRef = ref(db, 'participants');
        const judgesRef = ref(db, 'judges');
        const categoriesRef = ref(db, 'categoriesByLevel');
        const levelsRef = ref(db, 'performanceLevels');

        const initialJudgesData: Judge[] = [
            { id: 'juri-1', name: 'Juri 1' },
            { id: 'juri-2', name: 'Juri 2' },
            { id: 'juri-3', name: 'Juri 3' },
        ];
        
        const demoScores: Scores = {};
        const criteriaForDemo = INITIAL_CATEGORIES_BY_LEVEL['SMP'].flatMap(c => c.criteria).slice(0, 4);
        criteriaForDemo.forEach(c => {
            demoScores[c.id] = c.id === 1 ? 40 : 45;
        });

        const initialParticipantsData: Participant[] = [
            { id: 'tim-a', name: 'Tim A', level: 'SMP', scores: { [initialJudgesData[0].id]: demoScores } },
            { id: 'tim-b', name: 'Tim B', level: 'SD', scores: {} },
        ];


        const listeners = [
            onValue(participantsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const participantsFromDb = firebaseObjectToArray<Participant>(snapshot.val());
                    // Sanitize data: ensure every participant has a .scores property to prevent runtime errors
                    const sanitizedParticipants = participantsFromDb.map(p => ({
                        ...p,
                        scores: p.scores || {},
                    }));
                    setParticipants(sanitizedParticipants);
                } else {
                    // Seed data
                    const initialParticipantsObject = initialParticipantsData.reduce((acc, p) => ({...acc, [p.id]: p }), {});
                    set(participantsRef, initialParticipantsObject);
                }
            }),
            onValue(judgesRef, (snapshot) => {
                if (snapshot.exists()) {
                    setJudges(firebaseObjectToArray(snapshot.val()));
                } else {
                    // Seed data
                    const initialJudgesObject = initialJudgesData.reduce((acc, j) => ({...acc, [j.id]: j }), {});
                    set(judgesRef, initialJudgesObject);
                }
            }),
            onValue(categoriesRef, (snapshot) => {
                 if (snapshot.exists()) {
                    setCategoriesByLevel(snapshot.val());
                } else {
                    set(categoriesRef, INITIAL_CATEGORIES_BY_LEVEL);
                }
            }),
            onValue(levelsRef, (snapshot) => {
                if (snapshot.exists()) {
                    setPerformanceLevels(firebaseObjectToArray(snapshot.val()));
                } else {
                     const initialLevelsObject = INITIAL_PERFORMANCE_LEVELS.reduce((acc, l) => ({...acc, [l.id]: l }), {});
                    set(levelsRef, initialLevelsObject);
                }
            })
        ];
        
        setIsLoading(false);

        // Cleanup listeners on unmount
        return () => {
            listeners.forEach(unsubscribe => unsubscribe());
        };
    }, []);

    // PARTICIPANT HANDLERS
    const handleAddParticipant = useCallback((name: string, level: string) => {
        const id = crypto.randomUUID();
        const newParticipant: Participant = { id, name, level, scores: {} };
        set(ref(db, `participants/${id}`), newParticipant);
    }, []);

    const handleUpdateParticipant = useCallback((id: string, newName: string, newLevel: string) => {
        const participant = participants.find(p => p.id === id);
        if (participant) {
            set(ref(db, `participants/${id}`), { ...participant, name: newName, level: newLevel });
        }
    }, [participants]);

    const handleDeleteParticipant = useCallback((id: string) => {
        remove(ref(db, `participants/${id}`));
    }, []);

    // JUDGE HANDLERS
    const handleAddJudge = useCallback((name: string) => {
        const id = crypto.randomUUID();
        const newJudge: Judge = { id, name };
        set(ref(db, `judges/${id}`), newJudge);
    }, []);

    const handleUpdateJudge = useCallback((id: string, newName: string) => {
        const judge = judges.find(j => j.id === id);
        if (judge) {
            set(ref(db, `judges/${id}`), { ...judge, name: newName });
        }
    }, [judges]);

    const handleDeleteJudge = useCallback((id: string) => {
        remove(ref(db, `judges/${id}`));
        // Remove scores associated with the deleted judge from all participants
        participants.forEach(p => {
            if (p.scores[id]) {
                remove(ref(db, `participants/${p.id}/scores/${id}`));
            }
        });
    }, [participants]);

    // SCORE HANDLER
    const handleScoreChange = useCallback((participantId: string, judgeId: string, criterionId: number, score: number) => {
        const participant = participants.find(p => p.id === participantId);
        if (participant) {
            const currentScore = participant.scores?.[judgeId]?.[criterionId];
            if (currentScore === score) {
                // Unset the score
                remove(ref(db, `participants/${participantId}/scores/${judgeId}/${criterionId}`));
            } else {
                // Set the score
                set(ref(db, `participants/${participantId}/scores/${judgeId}/${criterionId}`), score);
            }
        }
    }, [participants]);
    
    // CRITERION & LEVEL HANDLERS (these affect the config, categoriesByLevel and performanceLevels)
    const allCriteria = useMemo(
        () =>
            // FIX: The type of `cats` was being inferred as `unknown`. Adding a type guard
            // with `Array.isArray` ensures we only call `flatMap` on an array, resolving the type error.
            Object.values(categoriesByLevel).flatMap(cats =>
                Array.isArray(cats)
                    ? cats.flatMap(c => (c && c.criteria) || [])
                    : [],
            ),
        [categoriesByLevel],
    );

    const handleAddCriterion = useCallback((level: string, categoryId: number, newCriterion: Omit<Criterion, 'id'>) => {
        const newId = Math.max(0, ...allCriteria.map(c => c.id)) + 1;
        const finalCriterion = { ...newCriterion, id: newId };
        
        const newLevelCategories = (categoriesByLevel[level] || []).map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, criteria: [...(cat.criteria || []), finalCriterion] };
            }
            return cat;
        });
        set(ref(db, `categoriesByLevel/${level}`), newLevelCategories);
    }, [categoriesByLevel, allCriteria]);

    const handleUpdateCriterion = useCallback((level: string, categoryId: number, updatedCriterion: Criterion) => {
        const newLevelCategories = (categoriesByLevel[level] || []).map(cat => {
            if (cat.id === categoryId) {
                const updatedCriteria = cat.criteria.map(crit => crit.id === updatedCriterion.id ? updatedCriterion : crit);
                return { ...cat, criteria: updatedCriteria };
            }
            return cat;
        });
        set(ref(db, `categoriesByLevel/${level}`), newLevelCategories);
    }, [categoriesByLevel]);

    const handleDeleteCriterion = useCallback((level: string, categoryId: number, criterionId: number) => {
         const newLevelCategories = (categoriesByLevel[level] || []).map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, criteria: cat.criteria.filter(crit => crit.id !== criterionId) };
            }
            return cat;
        });
        set(ref(db, `categoriesByLevel/${level}`), newLevelCategories);

        // Also remove scores for this criterion from participants
        participants.forEach(p => {
             if (p.level === level) {
                Object.keys(p.scores).forEach(judgeId => {
                    if (p.scores[judgeId]?.[criterionId]) {
                        remove(ref(db, `participants/${p.id}/scores/${judgeId}/${criterionId}`));
                    }
                });
             }
        });
    }, [categoriesByLevel, participants]);

    const handleAddPerformanceLevel = useCallback((level: Omit<PerformanceLevel, 'id'>) => {
        const newLevel = { ...level, id: crypto.randomUUID() };
        set(ref(db, `performanceLevels/${newLevel.id}`), newLevel);
        
        const newCategoriesByLevel = { ...categoriesByLevel };
        Object.keys(newCategoriesByLevel).forEach(levelKey => {
            newCategoriesByLevel[levelKey] = newCategoriesByLevel[levelKey].map(cat => ({
                ...cat,
                criteria: cat.criteria.map(crit => ({
                    ...crit,
                    scores: { ...(crit.scores || {}), [newLevel.id]: [] }
                }))
            }));
        });
        set(ref(db, `categoriesByLevel`), newCategoriesByLevel);

    }, [performanceLevels, categoriesByLevel]);

    const handleUpdatePerformanceLevel = useCallback((updatedLevel: PerformanceLevel) => {
        set(ref(db, `performanceLevels/${updatedLevel.id}`), updatedLevel);
    }, []);

    const handleDeletePerformanceLevel = useCallback((levelId: string) => {
        remove(ref(db, `performanceLevels/${levelId}`));

        const newCategoriesByLevel = { ...categoriesByLevel };
        Object.keys(newCategoriesByLevel).forEach(levelKey => {
            newCategoriesByLevel[levelKey] = newCategoriesByLevel[levelKey].map(cat => ({
                ...cat,
                criteria: cat.criteria.map(crit => {
                    const newScores = { ...crit.scores };
                    delete newScores[levelId];
                    return { ...crit, scores: newScores };
                })
            }));
        });
        set(ref(db, `categoriesByLevel`), newCategoriesByLevel);
    }, [categoriesByLevel]);


    return {
        isLoading,
        participants,
        judges,
        categoriesByLevel,
        performanceLevels,
        handlers: {
            handleAddParticipant,
            handleUpdateParticipant,
            handleDeleteParticipant,
            handleAddJudge,
            handleUpdateJudge,
            handleDeleteJudge,
            handleScoreChange,
            handleAddCriterion,
            handleUpdateCriterion,
            handleDeleteCriterion,
            handleAddPerformanceLevel,
            handleUpdatePerformanceLevel,
            handleDeletePerformanceLevel
        }
    };
};
