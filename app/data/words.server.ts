import fs from 'node:fs';
import path from 'node:path';
import type { GermanWord, VerbWord, NounWord, AdjectiveWord, CEFRLevel, WordType } from '../types/german';

let cachedWords: GermanWord[] | null = null;

function detectLevels(collections: string[] = []): { levels: CEFRLevel[]; isA1: boolean; isA2: boolean; isB1: boolean } {
  const levels: CEFRLevel[] = [];
  const isA1 = collections.includes('goethe-a1');
  const isA2 = collections.includes('goethe-a2');
  const isB1 = collections.includes('goethe-b1');

  if (isA1) levels.push('A1');
  if (isA2) levels.push('A2');
  if (isB1) levels.push('B1');

  return { levels, isA1, isA2, isB1 };
}

export function loadAllWords(): GermanWord[] {
  if (cachedWords) {
    return cachedWords;
  }

  const dataDir = path.resolve(process.cwd(), 'app/data');
  const files = ['page-1.json', 'page-2.json', 'page-3.json'];
  const allRawItems: any[] = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          allRawItems.push(...parsed);
        }
      } catch (err) {
        console.error(`Failed to read data file ${file}:`, err);
      }
    }
  }

  const normalized: GermanWord[] = [];

  for (const item of allRawItems) {
    const rawData = item.data || {};
    const collections = Array.isArray(rawData.collections) ? rawData.collections : [];
    const { levels, isA1, isA2, isB1 } = detectLevels(collections);

    if (item.word_type === 'verb' && rawData.infinitive) {
      const verb: VerbWord = {
        id: item.id || `verb-${rawData.infinitive}`,
        wordType: 'verb',
        infinitive: rawData.infinitive,
        english: rawData.english || '',
        partizipII: rawData.partizipII || '',
        conjugation: {
          ich: rawData.conjugation?.ich || '',
          du: rawData.conjugation?.du || '',
          erSieEs: rawData.conjugation?.erSieEs || '',
          wir: rawData.conjugation?.wir || '',
          ihr: rawData.conjugation?.ihr || '',
          sieSie: rawData.conjugation?.sieSie || '',
        },
        objectCases: Array.isArray(rawData.objectCases) ? rawData.objectCases : [],
        perfektType: rawData.perfektType || 'regular',
        auxiliaryVerb: rawData.auxiliaryVerb || 'haben',
        category: rawData.category || 'regular',
        collections,
        levels,
        isA1,
        isA2,
        isB1,
      };
      normalized.push(verb);
    } else if (item.word_type === 'noun' && (rawData.singular || rawData.artikel)) {
      const noun: NounWord = {
        id: item.id || `noun-${rawData.singular}`,
        wordType: 'noun',
        singular: rawData.singular || '',
        plural: rawData.plural || '',
        artikel: rawData.artikel || '',
        english: rawData.english || '',
        collections,
        levels,
        isA1,
        isA2,
        isB1,
      };
      normalized.push(noun);
    } else if (item.word_type === 'adjective' && rawData.positive) {
      const adj: AdjectiveWord = {
        id: item.id || `adj-${rawData.positive}`,
        wordType: 'adjective',
        positive: rawData.positive || '',
        comparative: rawData.comparative || null,
        superlative: rawData.superlative || null,
        synonyms: Array.isArray(rawData.synonyms) ? rawData.synonyms : [],
        antonyms: Array.isArray(rawData.antonyms) ? rawData.antonyms : [],
        english: rawData.english || '',
        collections,
        levels,
        isA1,
        isA2,
        isB1,
      };
      normalized.push(adj);
    }
  }

  cachedWords = normalized;
  return normalized;
}

export function getA1Verbs(): VerbWord[] {
  const words = loadAllWords();
  return words.filter((w): w is VerbWord => w.wordType === 'verb' && w.isA1);
}

export function getWordsByTypeAndLevel(
  wordType: WordType = 'verb',
  level: CEFRLevel | 'all' = 'A1'
): GermanWord[] {
  const words = loadAllWords();
  return words.filter((w) => {
    if (w.wordType !== wordType) return false;
    if (level === 'all') return true;
    if (level === 'A1') return w.isA1;
    if (level === 'A2') return w.isA2;
    if (level === 'B1') return w.isB1;
    return true;
  });
}

export function getAppStats() {
  const words = loadAllWords();
  let a1Verbs = 0;
  let a2Verbs = 0;
  let b1Verbs = 0;
  let totalVerbs = 0;
  let totalNouns = 0;
  let totalAdjectives = 0;

  for (const w of words) {
    if (w.wordType === 'verb') {
      totalVerbs++;
      if (w.isA1) a1Verbs++;
      if (w.isA2) a2Verbs++;
      if (w.isB1) b1Verbs++;
    } else if (w.wordType === 'noun') {
      totalNouns++;
    } else if (w.wordType === 'adjective') {
      totalAdjectives++;
    }
  }

  return {
    totalWords: words.length,
    totalVerbs,
    a1Verbs,
    a2Verbs,
    b1Verbs,
    totalNouns,
    totalAdjectives,
  };
}
