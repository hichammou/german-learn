import type { Route } from "./+types/home";
import { loadAllWords, getAppStats } from "../data/words.server";
import { DeckViewer } from "../components/DeckViewer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DeutschLernen - A1 German Verbs & Flashcards" },
    {
      name: "description",
      content:
        "Master German A1 verbs with interactive 3D flashcards displaying Partizip II, conjugations, auxiliary verbs, and object cases.",
    },
  ];
}

export async function loader() {
  const words = loadAllWords();
  const stats = getAppStats();
  return { words, stats };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <DeckViewer initialWords={loaderData.words} />
    </main>
  );
}
