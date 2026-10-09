import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { GermanWord, VerbWord, NounWord, AdjectiveWord, WordType, CEFRLevel } from '../types/german';
import { VerbFlashcard } from './VerbFlashcard';
import { NounFlashcard } from './NounFlashcard';
import { AdjectiveFlashcard } from './AdjectiveFlashcard';
import { speakGerman } from '../utils/speech';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Search,
  Filter,
  Volume2,
  Sparkles,
  LayoutGrid,
  Maximize2,
  CheckCircle2,
  Clock,
  Star,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Award,
  RotateCw,
  BookmarkCheck,
} from 'lucide-react';

interface DeckViewerProps {
  initialWords: GermanWord[];
}

export interface WordProgressState {
  level: string;
  index: number;
}

export type CurrentIndexesStorage = {
  [key in WordType]?: WordProgressState;
};

const STORAGE_KEY = 'current_indexes';
const HISTORY_KEY = 'current_indexes_history';
const WORD_TYPE_KEY = 'current_word_type';

function loadCurrentIndexes(): CurrentIndexesStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load current_indexes from localStorage', e);
  }
  return {
    verb: { level: 'A1', index: 0 },
    noun: { level: 'A1', index: 0 },
    adjective: { level: 'A1', index: 0 },
  };
}

function loadHistory(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load current_indexes_history from localStorage', e);
  }
  return {
    verb: { A1: 0, A2: 0, B1: 0, all: 0 },
    noun: { A1: 0, A2: 0, B1: 0, all: 0 },
    adjective: { A1: 0, A2: 0, B1: 0, all: 0 },
  };
}

function saveProgress(wordType: WordType, level: string, index: number) {
  try {
    // 1. Save current_indexes strictly matching: { [word_type]: { level: '', index: .. } }
    const current = loadCurrentIndexes();
    current[wordType] = {
      level,
      index,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

    // 2. Save level history to remember where user left off on every level
    const history = loadHistory();
    if (!history[wordType]) {
      history[wordType] = {};
    }
    history[wordType][level] = index;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // 3. Save active word type
    localStorage.setItem(WORD_TYPE_KEY, wordType);
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function DeckViewer({ initialWords }: DeckViewerProps) {
  // Mode: single focus card or full grid browse
  const [viewMode, setViewMode] = useState<'focus' | 'grid'>('focus');

  // Filters
  const [selectedWordType, setSelectedWordType] = useState<WordType>('verb');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('A1');
  const [searchQuery, setSearchQuery] = useState('');
  const [auxiliaryFilter, setAuxiliaryFilter] = useState<'all' | 'haben' | 'sein'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'irregular' | 'regular' | 'modal' | 'separable'>('all');
  const [objectCaseFilter, setObjectCaseFilter] = useState<'all' | 'akkusativ' | 'dativ' | 'prepositional'>('all');
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'favorites' | 'learning' | 'unmastered'>('all');

  // Interactive mastery and favorites tracked in localStorage
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [learningIds, setLearningIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Current card index in focus mode
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false);
  const isHydratedRef = useRef(false);

  // Load saved state from localStorage on mount (reload)
  useEffect(() => {
    try {
      const savedMastered = localStorage.getItem('german_mastered_ids');
      const savedLearning = localStorage.getItem('german_learning_ids');
      const savedFavorites = localStorage.getItem('german_favorite_ids');
      if (savedMastered) setMasteredIds(new Set(JSON.parse(savedMastered)));
      if (savedLearning) setLearningIds(new Set(JSON.parse(savedLearning)));
      if (savedFavorites) setFavoriteIds(new Set(JSON.parse(savedFavorites)));

      // Restore active word type and where the user left off
      const savedWordType = (localStorage.getItem(WORD_TYPE_KEY) as WordType) || 'verb';
      const storedIndexes = loadCurrentIndexes();
      const progress = storedIndexes[savedWordType];

      setSelectedWordType(savedWordType);

      if (progress) {
        if (progress.level) {
          setSelectedLevel(progress.level as any);
        }
        if (typeof progress.index === 'number') {
          setCurrentIndex(progress.index);
        }
      }
    } catch (e) {
      console.error('Could not load localStorage', e);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Sync mastery & favorites to localStorage
  const saveState = (key: string, set: Set<string>) => {
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  };

  const toggleMastered = useCallback((id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveState('german_mastered_ids', next);
      return next;
    });

    setLearningIds((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        saveState('german_learning_ids', next);
        return next;
      }
      return prev;
    });
  }, []);

  const toggleLearning = useCallback((id: string) => {
    setLearningIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveState('german_learning_ids', next);
      return next;
    });

    setMasteredIds((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        saveState('german_mastered_ids', next);
        return next;
      }
      return prev;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveState('german_favorite_ids', next);
      return next;
    });
  }, []);

  // Filter words
  const filteredWords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return initialWords.filter((w) => {
      // Word type filter
      if (w.wordType !== selectedWordType) return false;

      // Level filter
      if (selectedLevel !== 'all') {
        if (selectedLevel === 'A1' && !w.isA1) return false;
        if (selectedLevel === 'A2' && !w.isA2) return false;
        if (selectedLevel === 'B1' && !w.isB1) return false;
      }

      // Specific filters for verbs
      if (w.wordType === 'verb') {
        const verb = w as VerbWord;
        if (auxiliaryFilter !== 'all' && verb.auxiliaryVerb !== auxiliaryFilter) return false;
        if (categoryFilter !== 'all' && verb.category !== categoryFilter) return false;
        if (objectCaseFilter !== 'all' && !verb.objectCases.includes(objectCaseFilter)) return false;
      }

      // Mastery filter
      if (masteryFilter === 'favorites' && !favoriteIds.has(w.id)) return false;
      if (masteryFilter === 'learning' && !learningIds.has(w.id)) return false;
      if (masteryFilter === 'unmastered' && masteredIds.has(w.id)) return false;

      // Text query
      if (q) {
        if (w.wordType === 'verb') {
          const v = w as VerbWord;
          const matchInf = v.infinitive.toLowerCase().includes(q);
          const matchEng = v.english.toLowerCase().includes(q);
          const matchPart = v.partizipII.toLowerCase().includes(q);
          if (!matchInf && !matchEng && !matchPart) return false;
        } else if (w.wordType === 'noun') {
          const n = w as NounWord;
          const matchSing = n.singular.toLowerCase().includes(q);
          const matchPlur = n.plural.toLowerCase().includes(q);
          const matchEng = n.english.toLowerCase().includes(q);
          if (!matchSing && !matchPlur && !matchEng) return false;
        } else if (w.wordType === 'adjective') {
          const a = w as AdjectiveWord;
          const matchPos = a.positive.toLowerCase().includes(q);
          const matchEng = a.english.toLowerCase().includes(q);
          if (!matchPos && !matchEng) return false;
        }
      }

      return true;
    });
  }, [
    initialWords,
    selectedWordType,
    selectedLevel,
    searchQuery,
    auxiliaryFilter,
    categoryFilter,
    objectCaseFilter,
    masteryFilter,
    favoriteIds,
    learningIds,
    masteredIds,
  ]);

  // Handle switching word type (e.g. Verben, Nomen, Adjektive)
  const handleWordTypeChange = (newType: WordType) => {
    setSelectedWordType(newType);
    setIsCurrentCardFlipped(false);

    const storedIndexes = loadCurrentIndexes();
    const progress = storedIndexes[newType];

    let targetLevel: CEFRLevel | 'all' = selectedLevel;
    let targetIndex = 0;

    if (progress) {
      if (progress.level) {
        targetLevel = progress.level as any;
        setSelectedLevel(targetLevel);
      }
      if (typeof progress.index === 'number') {
        targetIndex = progress.index;
      }
    }

    setCurrentIndex(targetIndex);
    saveProgress(newType, targetLevel, targetIndex);
  };

  // Handle switching level (e.g. A1, A2, B1, all) - show user where they left off
  const handleLevelChange = (newLevel: CEFRLevel | 'all') => {
    setSelectedLevel(newLevel);
    setIsCurrentCardFlipped(false);

    const history = loadHistory();
    const storedIndexes = loadCurrentIndexes();
    let restoredIndex = 0;

    if (history[selectedWordType] && typeof history[selectedWordType][newLevel] === 'number') {
      restoredIndex = history[selectedWordType][newLevel];
    } else if (storedIndexes[selectedWordType]?.level === newLevel && typeof storedIndexes[selectedWordType]?.index === 'number') {
      restoredIndex = storedIndexes[selectedWordType]!.index;
    }

    setCurrentIndex(restoredIndex);
    saveProgress(selectedWordType, newLevel, restoredIndex);
  };

  // Keep index within bounds
  const activeIndex = filteredWords.length === 0 ? 0 : Math.min(currentIndex, filteredWords.length - 1);
  const currentCard = filteredWords[activeIndex];

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredWords.length === 0) return;
    setIsCurrentCardFlipped(false);
    const nextIndex = (activeIndex + 1) % filteredWords.length;
    setCurrentIndex(nextIndex);
    saveProgress(selectedWordType, selectedLevel, nextIndex);
  }, [filteredWords.length, activeIndex, selectedWordType, selectedLevel]);

  const handlePrev = useCallback(() => {
    if (filteredWords.length === 0) return;
    setIsCurrentCardFlipped(false);
    const prevIndex = (activeIndex - 1 + filteredWords.length) % filteredWords.length;
    setCurrentIndex(prevIndex);
    saveProgress(selectedWordType, selectedLevel, prevIndex);
  }, [filteredWords.length, activeIndex, selectedWordType, selectedLevel]);

  const handleShuffle = () => {
    if (filteredWords.length <= 1) return;
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    setIsCurrentCardFlipped(false);
    setCurrentIndex(randomIndex);
    saveProgress(selectedWordType, selectedLevel, randomIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsCurrentCardFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'k' && currentCard) {
        e.preventDefault();
        toggleMastered(currentCard.id);
      } else if (e.key.toLowerCase() === 'u' && currentCard) {
        e.preventDefault();
        toggleLearning(currentCard.id);
      } else if (e.key.toLowerCase() === 's' && currentCard) {
        e.preventDefault();
        const textToSpeak =
          currentCard.wordType === 'verb'
            ? (currentCard as VerbWord).infinitive
            : currentCard.wordType === 'noun'
            ? (currentCard as NounWord).singular
            : (currentCard as AdjectiveWord).positive;
        speakGerman(textToSpeak);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, handleNext, handlePrev, toggleMastered, toggleLearning]);

  // Overall statistics for current word set
  const totalInCurrentFilter = filteredWords.length;
  const masteredCount = useMemo(() => {
    return filteredWords.filter((w) => masteredIds.has(w.id)).length;
  }, [filteredWords, masteredIds]);
  const learningCount = useMemo(() => {
    return filteredWords.filter((w) => learningIds.has(w.id)).length;
  }, [filteredWords, learningIds]);
  const masteredPercentage = totalInCurrentFilter > 0 ? Math.round((masteredCount / totalInCurrentFilter) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* ================= APP HEADER & BRANDING ================= */}
      <header className="mb-8 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-3 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Goethe-Zertifikat A1 Flashcards</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          Deutsch<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">Lernen</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Master German A1 verbs with 3D interactive flashcards featuring Partizip II, conjugations, auxiliary verbs, and case rules.
        </p>

        {/* ================= MASTERY STATS BAR ================= */}
        <div className="mt-6 max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mastered: <strong>{masteredCount}</strong> ({masteredPercentage}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Learning: <strong>{learningCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Total Available: <strong>{totalInCurrentFilter}</strong></span>
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${masteredPercentage}%` }}
              title={`Mastered: ${masteredPercentage}%`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${totalInCurrentFilter > 0 ? (learningCount / totalInCurrentFilter) * 100 : 0}%` }}
              title={`Learning: ${learningCount}`}
            />
          </div>
        </div>
      </header>

      {/* ================= CONTROLS & FILTERS ================= */}
      <section className="mb-6 space-y-4">
        {/* Row 1: Word Types & CEFR Level Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
          {/* Word Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
            {(['verb', 'noun', 'adjective'] as WordType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleWordTypeChange(type)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedWordType === type
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {type === 'verb' ? 'Verben (A1 Focus)' : type === 'noun' ? 'Nomen' : 'Adjektive'}
              </button>
            ))}
          </div>

          {/* Level Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 w-full md:w-auto justify-center">
            {(['A1', 'A2', 'B1', 'all'] as (CEFRLevel | 'all')[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {lvl === 'all' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('focus')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'focus'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Single Focus Deck Mode"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deck</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Browse Mode"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search and Verb-specific Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search German or English (e.g. ${
                selectedWordType === 'verb' ? 'treffen, meet, hat...' : selectedWordType === 'noun' ? 'Tisch, table...' : 'gut, good...'
              })`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Verb Specific Filters (Auxiliary, Category, Object Case) */}
          {selectedWordType === 'verb' && (
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <select
                value={auxiliaryFilter}
                onChange={(e) => setAuxiliaryFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Auxiliary: All</option>
                <option value="haben">haben (hat)</option>
                <option value="sein">sein (ist)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Category: All</option>
                <option value="irregular">Irregular</option>
                <option value="regular">Regular</option>
                <option value="modal">Modal</option>
                <option value="separable">Separable</option>
              </select>

              <select
                value={objectCaseFilter}
                onChange={(e) => setObjectCaseFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Case: All</option>
                <option value="akkusativ">Akkusativ</option>
                <option value="dativ">Dativ</option>
                <option value="prepositional">Prepositional</option>
              </select>
            </div>
          )}

          {/* Mastery Status Filter */}
          <select
            value={masteryFilter}
            onChange={(e) => setMasteryFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="all">Status: All</option>
            <option value="unmastered">Unmastered Only</option>
            <option value="learning">Still Learning Only</option>
            <option value="favorites">Favorites Only (★)</option>
          </select>
        </div>
      </section>

      {/* ================= MAIN CONTENT AREA ================= */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No cards matched your filters</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try clearing search queries or relaxing category/auxiliary filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setAuxiliaryFilter('all');
              setCategoryFilter('all');
              setObjectCaseFilter('all');
              setMasteryFilter('all');
              handleLevelChange('A1');
              handleWordTypeChange('verb');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters to A1 Verbs
          </button>
        </div>
      ) : viewMode === 'focus' ? (
        /* ================= FOCUS DECK VIEW ================= */
        <div className="flex flex-col items-center">
          {/* Deck Counter & Actions Bar */}
          <div className="w-full max-w-xl flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-850 text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                Card <strong>{activeIndex + 1}</strong> of <strong>{filteredWords.length}</strong>
              </span>
              <button
                type="button"
                onClick={handleShuffle}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
                title="Shuffle deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCurrentCardFlipped((f) => !f)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-medium transition-colors border border-indigo-500/30 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isCurrentCardFlipped ? 'Flip Front' : 'Flip Back'}</span>
              </button>
            </div>
          </div>

          {/* Focus Flashcard Component */}
          <div className="w-full max-w-xl">
            {currentCard.wordType === 'verb' && (
              <VerbFlashcard
                verb={currentCard as VerbWord}
                isMastered={masteredIds.has(currentCard.id)}
                isLearning={learningIds.has(currentCard.id)}
                isFavorite={favoriteIds.has(currentCard.id)}
                onToggleMastered={toggleMastered}
                onToggleLearning={toggleLearning}
                onToggleFavorite={toggleFavorite}
                size="large"
                flipped={isCurrentCardFlipped}
                onFlipChange={setIsCurrentCardFlipped}
              />
            )}
            {currentCard.wordType === 'noun' && (
              <NounFlashcard
                noun={currentCard as NounWord}
                isMastered={masteredIds.has(currentCard.id)}
                isLearning={learningIds.has(currentCard.id)}
                isFavorite={favoriteIds.has(currentCard.id)}
                onToggleMastered={toggleMastered}
                onToggleLearning={toggleLearning}
                onToggleFavorite={toggleFavorite}
                size="large"
                flipped={isCurrentCardFlipped}
                onFlipChange={setIsCurrentCardFlipped}
              />
            )}
            {currentCard.wordType === 'adjective' && (
              <AdjectiveFlashcard
                adjective={currentCard as AdjectiveWord}
                isMastered={masteredIds.has(currentCard.id)}
                isLearning={learningIds.has(currentCard.id)}
                isFavorite={favoriteIds.has(currentCard.id)}
                onToggleMastered={toggleMastered}
                onToggleLearning={toggleLearning}
                onToggleFavorite={toggleFavorite}
                size="large"
                flipped={isCurrentCardFlipped}
                onFlipChange={setIsCurrentCardFlipped}
              />
            )}
          </div>

          {/* Navigation Controls Bar */}
          <div className="w-full max-w-xl flex items-center justify-between mt-6 px-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-medium text-sm transition-all hover:border-slate-700 shadow-md active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Quick Speak Button */}
            <button
              type="button"
              onClick={() => {
                if (!currentCard) return;
                const text =
                  currentCard.wordType === 'verb'
                    ? (currentCard as VerbWord).infinitive
                    : currentCard.wordType === 'noun'
                    ? (currentCard as NounWord).singular
                    : (currentCard as AdjectiveWord).positive;
                speakGerman(text);
              }}
              className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Pronounce word"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard Shortcuts Helper */}
          <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-500 flex-wrap">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">Space</kbd> Flip</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">→</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">K</kbd> Mark Mastered</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">U</kbd> Still Learning</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-850 border border-slate-800 font-mono text-slate-400">S</kbd> Speak</span>
          </div>
        </div>
      ) : (
        /* ================= GRID BROWSE VIEW ================= */
        <div>
          <div className="flex items-center justify-between mb-4 px-1 text-xs text-slate-400">
            <span>Showing <strong>{filteredWords.length}</strong> flashcards</span>
            <span>Click any card to flip and view details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word) => {
              const isMastered = masteredIds.has(word.id);
              const isLearning = learningIds.has(word.id);
              const isFavorite = favoriteIds.has(word.id);

              return (
                <div key={word.id}>
                  {word.wordType === 'verb' && (
                    <VerbFlashcard
                      verb={word as VerbWord}
                      isMastered={isMastered}
                      isLearning={isLearning}
                      isFavorite={isFavorite}
                      onToggleMastered={toggleMastered}
                      onToggleLearning={toggleLearning}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}
                  {word.wordType === 'noun' && (
                    <NounFlashcard
                      noun={word as NounWord}
                      isMastered={isMastered}
                      isLearning={isLearning}
                      isFavorite={isFavorite}
                      onToggleMastered={toggleMastered}
                      onToggleLearning={toggleLearning}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}
                  {word.wordType === 'adjective' && (
                    <AdjectiveFlashcard
                      adjective={word as AdjectiveWord}
                      isMastered={isMastered}
                      isLearning={isLearning}
                      isFavorite={isFavorite}
                      onToggleMastered={toggleMastered}
                      onToggleLearning={toggleLearning}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
