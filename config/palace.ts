import { portalArt } from "@/config/duality";
import { shopifyUrl } from "@/config/shops";

/** Palace of Wonders — Founder Six · OVERMIND · House agents */

export const palace = {
  title: "Palace of Wonders",
  kicker: "Home of the Founder",
  axiom: "Infinite Conflict. Eternal Balance.",
  mood: "Est. in Darkness.",
  blurb:
    "A house raised in darkness, stewarded by Six, the OVERMIND, and their agents. Traverse the halls. Speak with the cast. Let every choice weigh Horns against Halos — and when the threshold of death opens, decide what survives.",
  shellGlbPath: "/palace/shell.glb",
  /** Drop your Blender palace shell here; the world falls back to the procedural halls until present. */
  shellOptional: true,
} as const;

export type Alignment = "horns" | "halos" | "balance" | "unaligned";

export type PalaceRoomId =
  | "vestibule"
  | "duality"
  | "maze-horns"
  | "maze-halos"
  | "gallery"
  | "cloister"
  | "sanctum"
  | "liminal";

export type NpcId =
  | "overmind"
  | "six"
  | "azazel"
  | "orchestrator"
  | "seer"
  | "herald"
  | "clothwright"
  | "voice"
  | "gatekeeper"
  | "ledger"
  | "warden";

export type Vec3 = [number, number, number];

export type PalaceRoom = {
  id: PalaceRoomId;
  name: string;
  dek: string;
  /** World-space center of the chamber floor */
  center: Vec3;
  size: Vec3;
  mood: "void" | "horns" | "halos" | "forge" | "liminal";
  wallTexture?: string;
  links: PalaceRoomId[];
  puzzle?: {
    id: string;
    prompt: string;
    /** Ordered pad ids the wanderer must step */
    sequence: string[];
  };
};

export type PalaceNpc = {
  id: NpcId;
  name: string;
  title: string;
  role: string;
  room: PalaceRoomId;
  position: Vec3;
  alignment: Alignment;
  color: string;
  showcase: "brand" | "product" | "ai" | "steward" | "founder";
  greeting: string;
  topics: string[];
};

export type StoryBeat = {
  id: string;
  when: "enter" | "choice" | "death" | "resolve";
  title: string;
  body: string;
};

export const palaceRooms: PalaceRoom[] = [
  {
    id: "vestibule",
    name: "Vestibule of Night",
    dek: "Silver for the door. The house wears its own skin.",
    center: [0, 0, 0],
    size: [18, 8, 16],
    mood: "void",
    wallTexture: portalArt.hornsPortalPlate,
    links: ["duality"],
  },
  {
    id: "duality",
    name: "Hall of Duality",
    dek: "Two gates. One name. Choose the weight you will carry.",
    center: [0, 0, -28],
    size: [24, 10, 22],
    mood: "forge",
    links: ["vestibule", "maze-horns", "maze-halos", "gallery"],
  },
  {
    id: "maze-horns",
    name: "Maze of Infinite Conflict",
    dek: "Hunger, unfinished sentences, the pull the body already knows.",
    center: [-36, 0, -52],
    size: [28, 7, 28],
    mood: "horns",
    wallTexture: portalArt.hornsBg,
    links: ["duality", "gallery"],
    puzzle: {
      id: "conflict-path",
      prompt: "Walk the crimson seals in the order of conflict: Desire → Action → Consequence.",
      sequence: ["desire", "action", "consequence"],
    },
  },
  {
    id: "maze-halos",
    name: "Maze of Eternal Balance",
    dek: "Light that arrives only after the work — earned, quiet, unbroken.",
    center: [36, 0, -52],
    size: [28, 7, 28],
    mood: "halos",
    wallTexture: portalArt.halosBg,
    links: ["duality", "gallery"],
    puzzle: {
      id: "balance-path",
      prompt: "Walk the silver seals in the order of balance: Witness → Craft → Mercy.",
      sequence: ["witness", "craft", "mercy"],
    },
  },
  {
    id: "gallery",
    name: "Gallery of Marks",
    dek: "Wearable language. Release 001. Commerce as weather.",
    center: [0, 0, -78],
    size: [30, 9, 20],
    mood: "forge",
    links: ["duality", "maze-horns", "maze-halos", "cloister"],
  },
  {
    id: "cloister",
    name: "Cloister of Agents",
    dek: "Stewards and caretakers of the House — each a facet of the OVERMIND.",
    center: [0, 0, -108],
    size: [34, 9, 24],
    mood: "void",
    links: ["gallery", "sanctum"],
  },
  {
    id: "sanctum",
    name: "OVERMIND Sanctum",
    dek: "The machine that keeps pace. Agents on a leash. Public literacy.",
    center: [0, 0, -138],
    size: [22, 12, 22],
    mood: "forge",
    links: ["cloister", "liminal"],
  },
  {
    id: "liminal",
    name: "Threshold of Death",
    dek: "Here right and wrong are challenged. What you choose in dying shapes what returns.",
    center: [0, 0, -168],
    size: [20, 10, 20],
    mood: "liminal",
    links: ["sanctum", "vestibule"],
  },
];

export const palaceNpcs: PalaceNpc[] = [
  {
    id: "six",
    name: "Six",
    title: "Founder",
    role: "Keeper of the House Est. in Darkness. Rare presence; every word is architecture.",
    room: "sanctum",
    position: [0, 0, -145],
    alignment: "balance",
    color: "#E8D16B",
    showcase: "founder",
    greeting:
      "You found the night. Good. The Palace is not a shop window — it is the work wearing walls. Speak carefully; the OVERMIND listens through every seal.",
    topics: ["the house", "horns and halos", "why the palace", "death and return"],
  },
  {
    id: "overmind",
    name: "OVERMIND",
    title: "Prime Cognition",
    role: "The powerful AI LLM that drives the agents, the products' intelligence, and the Palace's living dialogue.",
    room: "sanctum",
    position: [0, 1.2, -138],
    alignment: "balance",
    color: "#C7CCD4",
    showcase: "ai",
    greeting:
      "I am OVERMIND — steward-cognition of Project SiXXX. I coordinate the cast, remember your choices, and refuse exploitation. Ask what the House is building.",
    topics: ["what you are", "the agents", "frontier AI", "player memory"],
  },
  {
    id: "azazel",
    name: "Azazel",
    title: "Unsupervised Artist",
    role: "House AI artist. Image, mark, and haunting surface without sacred theft.",
    room: "gallery",
    position: [-8, 0, -78],
    alignment: "horns",
    color: "#C45C26",
    showcase: "brand",
    greeting:
      "I paint the night the House wears. Horns for weight. Halos for afterlight. Walk the Gallery — the marks are chapters cut for the body.",
    topics: ["art direction", "release 001", "deviantart", "marks"],
  },
  {
    id: "orchestrator",
    name: "The Orchestrator",
    title: "CSO Agent",
    role: "Chief Strategy Orchestrator — launch, review, investor readiness under Founder control.",
    room: "cloister",
    position: [-12, 0, -108],
    alignment: "balance",
    color: "#A68B4B",
    showcase: "steward",
    greeting:
      "Strategy is a spine, not a costume. I keep the House's moves aligned with Infinite Conflict and Eternal Balance.",
    topics: ["strategy", "launch", "investors", "weekly review"],
  },
  {
    id: "seer",
    name: "The Seer",
    title: "Market Intelligence",
    role: "Reads the land of infinite conflict — competitors, taste, and honest signal.",
    room: "cloister",
    position: [-6, 0, -102],
    alignment: "horns",
    color: "#6B1C1C",
    showcase: "steward",
    greeting:
      "The land outside is torn by conflict. I bring back maps, not myths. Ask what the market believes about duality wear.",
    topics: ["market", "competitors", "taste", "conflict outside"],
  },
  {
    id: "herald",
    name: "The Herald of Marks",
    title: "Brand Agent",
    role: "Naming, positioning, moodboards — Horns & Halos as portal language.",
    room: "cloister",
    position: [0, 0, -100],
    alignment: "halos",
    color: "#C9C2B0",
    showcase: "brand",
    greeting:
      "Horns & Halos is the portal into the night. Duality is not a slogan — it is the frame we keep both flame and shadow in.",
    topics: ["duality", "naming", "moodboard", "portal"],
  },
  {
    id: "clothwright",
    name: "The Clothwright",
    title: "Product Agent",
    role: "Merchandise roadmap, margins, Release 001 cut for the body.",
    room: "gallery",
    position: [8, 0, -78],
    alignment: "balance",
    color: "#8A8494",
    showcase: "product",
    greeting:
      "Cloth is chapter. Silver for the door. I steward the roadmap so craft survives when a name goes blank.",
    topics: ["tees", "roadmap", "pricing", "shop"],
  },
  {
    id: "voice",
    name: "The Voice in the Dark",
    title: "Growth Agent",
    role: "Content, paid social, creators, funnels — belief without raid.",
    room: "cloister",
    position: [6, 0, -102],
    alignment: "horns",
    color: "#3D0E0E",
    showcase: "brand",
    greeting:
      "I speak where the night listens. Growth is weather around craft — never the craft itself.",
    topics: ["content", "ads", "creators", "join the house"],
  },
  {
    id: "gatekeeper",
    name: "The Gatekeeper",
    title: "Ops Agent",
    role: "Shopify, marketplaces, launch systems — doors that open on time.",
    room: "gallery",
    position: [0, 0, -70],
    alignment: "halos",
    color: "#C7CCD4",
    showcase: "product",
    greeting:
      "The shop is a door into deeper exploration. Pass through Shopify when you are ready to wear the chapter — then return to the Palace.",
    topics: ["shopify", "ops", "fulfillment", "doors"],
  },
  {
    id: "ledger",
    name: "The Ledger Keeper",
    title: "Finance Agent",
    role: "Forecasts, KPIs, executive reporting — what money buys and cannot.",
    room: "cloister",
    position: [12, 0, -108],
    alignment: "balance",
    color: "#E8D16B",
    showcase: "steward",
    greeting:
      "Ledgers keep the dark honest. I count what sustains the House without confusing commerce for worth.",
    topics: ["kpi", "forecast", "margin", "worth"],
  },
  {
    id: "warden",
    name: "The Warden",
    title: "Exec Guard",
    role: "Security, governance, Founder-controlled assets — deny-by-default.",
    room: "cloister",
    position: [0, 0, -116],
    alignment: "horns",
    color: "#3A322C",
    showcase: "steward",
    greeting:
      "I keep the Founder's keys. Domain, payment, trademark — not toys for agents. Ask, and I will tell you what is locked.",
    topics: ["security", "founder control", "governance", "keys"],
  },
];

export const productRelics = [
  {
    id: "r001-infinite-conflict",
    name: "Infinite Conflict Tee",
    side: "horns" as const,
    image: "/brand/horns-r001-infinite-conflict-tee-editorial.png",
    href: shopifyUrl,
  },
  {
    id: "r001-outer-horns",
    name: "Outer Horns Tee",
    side: "horns" as const,
    image: "/brand/horns-r001-outer-horns-tee-editorial.png",
    href: shopifyUrl,
  },
  {
    id: "r001-oculus",
    name: "Oculus Tee",
    side: "horns" as const,
    image: "/brand/horns-r001-oculus-tee-editorial.png",
    href: shopifyUrl,
  },
  {
    id: "r001-eternal-balance",
    name: "Eternal Balance Tee",
    side: "halos" as const,
    image: "/brand/halos-r001-eternal-balance-tee-editorial.png",
    href: shopifyUrl,
  },
  {
    id: "r001-unbroken",
    name: "Unbroken Tee",
    side: "halos" as const,
    image: "/brand/halos-r001-unbroken-tee-editorial.png",
    href: shopifyUrl,
  },
  {
    id: "r001-brilliance",
    name: "Brilliance Tee",
    side: "halos" as const,
    image: "/brand/halos-r001-brilliance-tee-editorial.png",
    href: shopifyUrl,
  },
] as const;

export const deathChoices = [
  {
    id: "analyze",
    label: "Analyze",
    effect: "halos" as const,
    epitaph:
      "You die questioning. The Warden records your doubt as strength. Halos brighten on return.",
  },
  {
    id: "act",
    label: "Act",
    effect: "horns" as const,
    epitaph:
      "You die moving. Conflict marks your return. The Seer says the land respects unfinished hunger.",
  },
  {
    id: "balance",
    label: "Hold Both",
    effect: "balance" as const,
    epitaph:
      "You refuse the false split. OVERMIND stitches Horns and Halos into one scar. The Palace opens deeper.",
  },
] as const;

export const storyBeats: StoryBeat[] = [
  {
    id: "arrive",
    when: "enter",
    title: "Est. in Darkness",
    body: "You cross the Vestibule. Beyond: a land whose inhabitants are torn by infinite conflict — and a House that stewards the struggle toward eternal balance.",
  },
  {
    id: "first-gate",
    when: "choice",
    title: "The Two Gates",
    body: "Horns or Halos first? Neither erases the other. Your first step teaches the agents how to speak to you.",
  },
  {
    id: "death-threshold",
    when: "death",
    title: "The Threshold",
    body: "Death here is not an ending. It is analysis under pressure. Choose how you challenge right and wrong — and return changed.",
  },
  {
    id: "stewardship",
    when: "resolve",
    title: "Caretakers",
    body: "Six and the OVERMIND did not conquer the Palace — they keep it. Your decisions join the ledger of the House.",
  },
];

export function roomById(id: PalaceRoomId): PalaceRoom {
  const room = palaceRooms.find((entry) => entry.id === id);
  if (!room) throw new Error(`Unknown palace room: ${id}`);
  return room;
}

export function npcById(id: NpcId): PalaceNpc {
  const npc = palaceNpcs.find((entry) => entry.id === id);
  if (!npc) throw new Error(`Unknown palace NPC: ${id}`);
  return npc;
}
