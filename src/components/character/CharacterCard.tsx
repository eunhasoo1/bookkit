import { Character } from "@/types";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-stone-300 text-stone-400">
        👤
      </div>
      <p className="text-sm font-medium text-stone-700">
        {character.name}
      </p>
    </div>
  );
}
