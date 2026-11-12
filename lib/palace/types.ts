import type { Alignment, NpcId, PalaceRoomId } from "@/config/palace";

export type PalaceSave = {
  version: 1;
  horns: number;
  halos: number;
  deaths: number;
  gateChosen: Alignment;
  roomsVisited: PalaceRoomId[];
  puzzlesSolved: string[];
  spokenWith: NpcId[];
  lastDeathChoice: string | null;
  flags: string[];
};

export type NpcChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type NpcChatRequest = {
  npcId: NpcId;
  message: string;
  history?: NpcChatMessage[];
  save?: PalaceSave;
};

export type NpcChatResponse = {
  reply: string;
  source: "llm" | "script";
  suggested?: string[];
};

export const PALACE_SAVE_KEY = "sixxx-palace-save-v1";

export function defaultSave(): PalaceSave {
  return {
    version: 1,
    horns: 0,
    halos: 0,
    deaths: 0,
    gateChosen: "unaligned",
    roomsVisited: ["vestibule"],
    puzzlesSolved: [],
    spokenWith: [],
    lastDeathChoice: null,
    flags: [],
  };
}

export function dominantAlignment(save: PalaceSave): Alignment {
  if (save.horns === save.halos) {
    if (save.horns === 0 && save.halos === 0) return save.gateChosen;
    return "balance";
  }
  return save.horns > save.halos ? "horns" : "halos";
}
