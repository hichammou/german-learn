import React, { useState } from 'react';
import type { NounWord } from '../types/german';
import { speakGerman } from '../utils/speech';
import { Volume2, RotateCw, Star, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface NounFlashcardProps {
  noun: NounWord;
  isMastered?: boolean;
  isLearning?: boolean;
  isFavorite?: boolean;
  onToggleMastered?: (id: string) => void;
  onToggleLearning?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  size?: 'normal' | 'large';
  flipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

export function NounFlashcard({
  noun,
  isMastered = false,
  isLearning = false,
  isFavorite = false,
  onToggleMastered,
  onToggleLearning,
  onToggleFavorite,
  size = 'normal',
  flipped: controlledFlipped,
  onFlipChange,
}: NounFlashcardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleFlip = () => {
    const next = !isFlipped;
    if (onFlipChange) {
      onFlipChange(next);
    } else {
      setInternalFlipped(next);
    }
  };

  const handleAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakGerman(text);
  };

  const genderClass =
    noun.artikel === 'der'
      ? 'border-sky-500/40 text-sky-300 bg-sky-500/15'
      : noun.artikel === 'die'
      ? 'border-rose-500/40 text-rose-300 bg-rose-500/15'
      : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/15';

  const genderName =
    noun.artikel === 'der' ? 'Maskulin' : noun.artikel === 'die' ? 'Feminin' : 'Neutrum';

  return (
    <div
      className={`group relative w-full perspective-1200 cursor-pointer select-none ${
        size === 'large' ? 'h-[500px] max-w-xl mx-auto' : 'h-[420px]'
      }`}
      onClick={handleFlip}
    >
      <div
        className={`relative w-full h-full duration-500 ease-out transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 flex flex-col justify-between shadow-xl shadow-slate-950/60 hover:border-slate-500/80 transition-all">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {noun.isA1 ? 'A1' : noun.levels[0] || 'A1'}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${genderClass}`}>
                {noun.artikel} • {genderName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleAudio(e, noun.singular)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(noun.id);
                  }}
                  className={`p-2 rounded-xl transition-colors border ${
                    isFavorite
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/50'
                  }`}
                  title="Favorite"
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4">
            <div className="text-xs uppercase font-semibold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Nomen (Singular)
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-2">
              {noun.singular}
            </h2>
            <div className="text-sm font-medium text-slate-400 mt-1">
              Plural: <span className="text-slate-200">{noun.plural}</span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              {isMastered && <span className="text-emerald-400 font-medium">✓ Mastered</span>}
              {isLearning && !isMastered && <span className="text-amber-400 font-medium">⏳ Learning</span>}
              {!isMastered && !isLearning && <span className="text-slate-500">Not studied yet</span>}
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400 group-hover:text-indigo-300 font-medium transition-colors">
              <span>Click to reveal English & Plural</span>
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-sky-500/40 bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950/40 p-6 flex flex-col justify-between shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-xl font-bold text-white">{noun.singular}</span>
              <p className="text-base font-medium text-emerald-400 mt-1">{noun.english}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => handleAudio(e, `${noun.singular}. ${noun.plural}`)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 my-auto">
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase font-semibold">Artikel & Genus</div>
              <div className="text-lg font-bold text-sky-300 mt-0.5">
                {noun.artikel} <span className="text-sm font-normal text-slate-300">({genderName})</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-850 border border-slate-700">
              <div className="text-xs text-slate-400 uppercase font-semibold">Plural Form</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{noun.plural}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            {onToggleLearning && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLearning(noun.id);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 ${
                  isLearning && !isMastered
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Still Learning
              </button>
            )}
            {onToggleMastered && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastered(noun.id);
                }}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 ${
                  isMastered
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mastered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
