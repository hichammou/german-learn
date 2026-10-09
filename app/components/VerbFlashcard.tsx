import React, { useState } from 'react';
import type { VerbWord } from '../types/german';
import { speakGerman } from '../utils/speech';
import { Volume2, RotateCw, Star, CheckCircle2, Clock, Sparkles, BookOpen, Layers } from 'lucide-react';

interface VerbFlashcardProps {
  verb: VerbWord;
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

export function VerbFlashcard({
  verb,
  isMastered = false,
  isLearning = false,
  isFavorite = false,
  onToggleMastered,
  onToggleLearning,
  onToggleFavorite,
  size = 'normal',
  flipped: controlledFlipped,
  onFlipChange,
}: VerbFlashcardProps) {
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

  // Helper colors for auxiliary verb
  const isSein = verb.auxiliaryVerb === 'sein';
  const auxBadgeClass = isSein
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : 'bg-sky-500/15 text-sky-300 border-sky-500/30';

  // Helper colors for verb category
  const categoryBadgeClass =
    verb.category === 'irregular'
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      : verb.category === 'modal'
      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
      : verb.category === 'separable'
      ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

  return (
    <div
      className={`group relative w-full perspective-1200 select-none ${
        size === 'large' ? 'h-[500px] max-w-xl mx-auto' : 'h-[420px]'
      }`}
    >
      {/* 3D Inner Container */}
      <div
        className={`relative w-full h-full duration-500 ease-out transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ================= FRONT SIDE ================= */}
        <div
          onClick={handleFlip}
          className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 flex flex-col justify-between shadow-xl shadow-slate-950/60 hover:border-slate-500/80 transition-all hover:shadow-indigo-500/10 cursor-pointer ${
            isFlipped ? 'pointer-events-none opacity-0 invisible' : 'pointer-events-auto opacity-100 visible'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                {verb.isA1 ? 'A1' : verb.levels[0] || 'A1'}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${categoryBadgeClass} capitalize`}>
                {verb.category}
              </span>
              <span className={`px-2.5 py-1 text-xs font-mono font-medium rounded-full border ${auxBadgeClass}`}>
                {verb.auxiliaryVerb === 'sein' ? 'ist + Partizip II' : 'hat + Partizip II'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleAudio(e, verb.infinitive)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
                title="Listen to pronunciation"
                aria-label="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(verb.id);
                  }}
                  className={`p-2 rounded-xl transition-colors border ${
                    isFavorite
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/50'
                  }`}
                  title="Favorite card"
                  aria-label="Favorite"
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Center German Verb */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4">
            <div className="text-xs uppercase font-semibold tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              German Infinitive
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight mb-3">
              {verb.infinitive}
            </h2>

            {/* Quick Grammar Teasers */}
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {verb.objectCases.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-800 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider"
                >
                  +{c}
                </span>
              ))}
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                Perfekt: {verb.perfektType}
              </span>
            </div>
          </div>

          {/* Bottom Action / Flip hint */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              {isMastered && (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                </span>
              )}
              {isLearning && !isMastered && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Learning
                </span>
              )}
              {!isMastered && !isLearning && (
                <span className="text-slate-500">Not studied yet</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-indigo-400 group-hover:text-indigo-300 font-medium transition-colors">
              <span>Click to reveal details</span>
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 p-5 md:p-6 flex flex-col justify-between shadow-2xl shadow-indigo-950/40 ${
            isFlipped ? 'pointer-events-auto opacity-100 visible' : 'pointer-events-none opacity-0 invisible'
          }`}
        >
          {/* Header on Back */}
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold text-white">{verb.infinitive}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {verb.isA1 ? 'A1' : verb.levels[0] || 'A1'}
                </span>
              </div>
              <p className="text-sm md:text-base font-medium text-emerald-400 mt-0.5">
                {verb.english}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleAudio(e, `${verb.infinitive}. ${verb.auxiliaryVerb === 'sein' ? 'ist' : 'hat'} ${verb.partizipII}`)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="Pronounce infinitive and Partizip II"
                aria-label="Pronounce"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="px-2 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors border border-indigo-500/30 text-xs font-medium flex items-center gap-1"
                title="Flip back to front"
                aria-label="Flip back"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Front</span>
              </button>
            </div>
          </div>

          {/* Grammar Details: Partizip II & Auxiliary */}
          <div className="my-2.5 grid grid-cols-2 gap-2 text-xs">
            {/* Partizip II Box */}
            <div className="p-2.5 rounded-xl bg-slate-850/90 border border-slate-700/60 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Partizip II
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xs text-sky-400 font-mono font-medium">
                  {verb.auxiliaryVerb === 'sein' ? 'ist' : 'hat'}
                </span>
                <span className="text-sm md:text-base font-bold text-amber-300 font-mono">
                  {verb.partizipII}
                </span>
              </div>
            </div>

            {/* Perfect & Auxiliary Info */}
            <div className="p-2.5 rounded-xl bg-slate-850/90 border border-slate-700/60 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Perfekt & Hilfsverb
              </span>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-medium font-mono text-[11px] border border-sky-500/30">
                  {verb.auxiliaryVerb}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 capitalize">
                  {verb.perfektType}
                </span>
              </div>
            </div>
          </div>

          {/* Conjugation Grid (Präsens) */}
          <div className="my-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Conjugation (Präsens)
              </span>
              {verb.category === 'irregular' && (
                <span className="text-[10px] text-rose-300/90 font-medium">irregular stem</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">ich</span>
                <span className="font-semibold text-slate-100">{verb.conjugation.ich || '—'}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">wir</span>
                <span className="font-semibold text-slate-100">{verb.conjugation.wir || '—'}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">du</span>
                <span className={`font-semibold ${verb.category === 'irregular' ? 'text-amber-300' : 'text-slate-100'}`}>
                  {verb.conjugation.du || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">ihr</span>
                <span className="font-semibold text-slate-100">{verb.conjugation.ihr || '—'}</span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">er/sie/es</span>
                <span className={`font-semibold ${verb.category === 'irregular' ? 'text-amber-300' : 'text-slate-100'}`}>
                  {verb.conjugation.erSieEs || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[11px]">sie / Sie</span>
                <span className="font-semibold text-slate-100">{verb.conjugation.sieSie || '—'}</span>
              </div>
            </div>
          </div>

          {/* Object Case Bar */}
          <div className="my-1.5 px-3 py-2 rounded-xl bg-slate-850/80 border border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Object Case:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {verb.objectCases.length > 0 ? (
                verb.objectCases.map((c) => (
                  <span
                    key={c}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                      c === 'akkusativ'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : c === 'dativ'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs">none</span>
              )}
            </div>
          </div>

          {/* Mastery Feedback Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            {onToggleLearning && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLearning(verb.id);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                  isLearning && !isMastered
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {isLearning && !isMastered ? 'In Progress' : 'Still Learning'}
              </button>
            )}

            {onToggleMastered && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastered(verb.id);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                  isMastered
                    ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-1 ring-emerald-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isMastered ? 'Mastered' : 'Mark Mastered'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
