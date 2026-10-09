export type WordType = 'verb' | 'noun' | 'adjective';
export type CEFRLevel = 'A1' | 'A2' | 'B1';

export interface VerbConjugation {
  ich: string;
  du: string;
  erSieEs: string;
  wir: string;
  ihr: string;
  sieSie: string;
}

export interface VerbWord {
  id: string;
  wordType: 'verb';
  infinitive: string;
  english: string;
  partizipII: string;
  conjugation: VerbConjugation;
  objectCases: string[];
  perfektType: string;
  auxiliaryVerb: 'haben' | 'sein' | string;
  category: string;
  collections: string[];
  levels: CEFRLevel[];
  isA1: boolean;
  isA2: boolean;
  isB1: boolean;
}

export interface NounWord {
  id: string;
  wordType: 'noun';
  singular: string;
  plural: string;
  artikel: 'der' | 'die' | 'das' | string;
  english: string;
  collections: string[];
  levels: CEFRLevel[];
  isA1: boolean;
  isA2: boolean;
  isB1: boolean;
}

export interface AdjectiveWord {
  id: string;
  wordType: 'adjective';
  positive: string;
  comparative: string | null;
  superlative: string | null;
  synonyms: string[];
  antonyms: string[];
  english: string;
  collections: string[];
  levels: CEFRLevel[];
  isA1: boolean;
  isA2: boolean;
  isB1: boolean;
}

export type GermanWord = VerbWord | NounWord | AdjectiveWord;

export interface FilterOptions {
  wordType: WordType;
  level: CEFRLevel | 'all';
  search: string;
  auxiliary?: 'all' | 'haben' | 'sein';
  verbCategory?: 'all' | 'regular' | 'irregular' | 'modal' | 'separable';
  objectCase?: 'all' | 'akkusativ' | 'dativ' | 'prepositional';
}
