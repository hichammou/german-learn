import React, { useState } from 'react';
import type { AdjectiveWord } from '../types/german';
import { speakGerman } from '../utils/speech';
import { Volume2, RotateCw, Star, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface AdjectiveFlashcardProps {
  adjective: AdjectiveWord;
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

export function AdjectiveFlashcard({
  adjective,
  isMastered = false,
  isLearning = false,
  isFavorite = false,
  onToggleMastered,
  onToggleLearning,
  onToggleFavorite,
  size = 'normal',
  flipped: controlledFlipped,
  onFlipChange,
}: AdjectiveFlashcardProps) {
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
                {adjective.isA1 ? 'A1' : adjective.levels[0] || 'A1'}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/15">
                Adjektiv
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleAudio(e, adjective.positive)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
                title="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(adjective.id);
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
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              German Adjective
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-2">
              {adjective.positive}
            </h2>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              {isMastered && <span className="text-emerald-400 font-medium">✓ Mastered</span>}
              {isLearning && !isMastered && <span className="text-amber-400 font-medium">⏳ Learning</span>}
              {!isMastered && !isLearning && <span className="text-slate-500">Not studied yet</span>}
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400 group-hover:text-indigo-300 font-medium transition-colors">
              <span>Click to reveal details</span>
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-slate-900 via-slate-850 to-purple-950/40 p-6 flex flex-col justify-between shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-xl font-bold text-white">{adjective.positive}</span>
              <p className="text-base font-medium text-emerald-400 mt-1">{adjective.english}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => handleAudio(e, `${adjective.positive}`)}
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
                className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 my-auto text-xs">
            {adjective.comparative && (
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Komparativ</span>
                <span className="font-bold text-amber-300 font-mono text-sm">{adjective.comparative}</span>
              </div>
            )}
            {adjective.superlative && (
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Superlativ</span>
                <span className="font-bold text-sky-300 font-mono text-sm">{adjective.superlative}</span>
              </div>
            )}
            {adjective.synonyms.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Synonyme</span>
                <div className="flex flex-wrap gap-1">
                  {adjective.synonyms.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {adjective.antonyms.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">Antonyme</span>
                <div className="flex flex-wrap gap-1">
                  {adjective.antonyms.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            {onToggleLearning && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLearning(adjective.id);
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
                  onToggleMastered(adjective.id);
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
