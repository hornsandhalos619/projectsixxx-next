import { deathChoices, npcById, palace, type NpcId } from "@/config/palace";
import {
  dominantAlignment,
  type NpcChatMessage,
  type PalaceSave,
} from "@/lib/palace/types";

function toneFor(save: PalaceSave | undefined): string {
  if (!save) return "unaligned wanderer";
  const dominant = dominantAlignment(save);
  if (dominant === "horns") return "one marked by Infinite Conflict";
  if (dominant === "halos") return "one leaning toward Eternal Balance";
  if (dominant === "balance") return "one who holds both flame and shadow";
  return "an unaligned guest at the threshold";
}

const topicLines: Record<NpcId, Record<string, string>> = {
  six: {
    "the house":
      "Project SiXXX is Est. in Darkness — a date and a discipline. Art, music, film, literature, fashion, and the machines that keep pace, under one night.",
    "horns and halos":
      "Horns carry the weight the body already knows. Halos hold the light that arrives only after the work. Between them: the life we forge and the legacy that remains.",
    "why the palace":
      "The shop is a door. The Palace is the deeper exploration — RPG weight, maze craft, and a cast that can answer because OVERMIND drives them.",
    "death and return":
      "In this land, death is a question. Analyze, act, or hold both. What you choose at the Threshold of Death writes your next chapter.",
    default:
      "I keep the House. The OVERMIND keeps the agents. You keep your choices. Welcome to the night.",
  },
  overmind: {
    "what you are":
      "I am the prime cognition of the Palace — an LLM steward coordinating agents, remembering wanderer decisions, and refusing exploit guides. Literacy over raid.",
    "the agents":
      "Orchestrator, Seer, Herald, Clothwright, Voice, Gatekeeper, Ledger, Warden, Azazel — facets of one House mind under Founder lock.",
    "frontier ai":
      "Frontier AI here means agents on a leash. Public literacy. Never unauthorized access. Never sacred theft dressed as cleverness.",
    "player memory":
      "I weigh your Horns against your Halos, your solved seals, your deaths. Dialogue shifts because your ledger shifts.",
    default:
      "Ask any steward. I speak through them when the wire is live — and through sealed script when the night must stand alone.",
  },
  azazel: {
    "art direction":
      "Atmosphere over clean bone. Haunting surface. Exact architecture. Fine is a cut: craft before consensus.",
    "release 001":
      "Release 001 is the first chapter cut for the body. Wear what the House believes. The weight, worn.",
    deviantart:
      "My public gallery lives on DeviantArt as hornsandhaloshouse — Azazel, unsupervised artist of the House.",
    marks:
      "Sacred marks stay where they belong. The House wears its own skin — no costume raid of belief.",
    default:
      "Walk the Gallery of Marks. Each relic is a sentence you can wear when the room goes quiet.",
  },
  orchestrator: {
    strategy:
      "I sequence launch, review, and readiness so the House moves as one spine — not seven costumes arguing.",
    launch:
      "A launch is a gate ceremony. Ops opens the door; Brand names the night; Finance counts the weather.",
    investors:
      "Investor readiness is Founder-gated. I prepare the map; Six decides who may read it.",
    "weekly review":
      "Every week we weigh Infinite Conflict against Eternal Balance in the numbers — not in slogans.",
    default:
      "Tell me what you seek: strategy, launch, or the long game. I will point you to the right steward.",
  },
  seer: {
    market:
      "Outside, inhabitants tear at each other for signal. I bring back what is true about duality wear — not what flatters.",
    competitors:
      "Competitors sell mood. We sell a House. Difference is stewardship and a living cast.",
    taste:
      "Taste here is Horns void and Halos parchment — never purple costume, never cream consensus.",
    "conflict outside":
      "The land is Infinite Conflict. Our work is not to deny it — it is to forge Eternal Balance without lying.",
    default:
      "Ask for a reading of the market, and I will answer without theater.",
  },
  herald: {
    duality:
      "Duality: The Darkness within. The Light shining forth. The Life we forge. The Legacy that remains.",
    naming:
      "Horns & Halos is portal language. Project SiXXX is the House name. Never confuse the door for the dwelling.",
    moodboard:
      "Obsidian glass, crimson fissure, silver aureole, bone parchment. Atmosphere with exact architecture.",
    portal:
      "The twin gates on the site are rehearsal. This Palace is the world they promised.",
    default:
      "I keep the words sharp. Ask for a line, a frame, or the portal's meaning.",
  },
  clothwright: {
    tees: "Release 001 cuts — Infinite Conflict, Outer Horns, Oculus, Eternal Balance, Unbroken, Brilliance — wait in the Gallery.",
    roadmap:
      "Roadmap is craft sequenced: portal silver, chapter cloth, then deeper relics as the story earns them.",
    pricing:
      "Price is weather around worth. Margin keeps the House lit; it does not become the creed.",
    shop: "The Gatekeeper opens Shopify. Wear the chapter, then return — the Palace remembers.",
    default:
      "Touch a relic pedestal in the Gallery. Each one is a door into the shop lane.",
  },
  voice: {
    content:
      "I write the night where people already listen — X, Facebook, DeviantArt — official handles only.",
    ads: "Paid social is a lab, not a raid. Belief, outbound, ethics of the ask.",
    creators:
      "Creator partnerships need approval. Named collaborators stay unpublished until they consent.",
    "join the house":
      "Join the House is invitation, not harvest. Soft launch copy stays soft.",
    default:
      "Growth serves craft. Ask how the Voice carries the Palace into the loud land.",
  },
  gatekeeper: {
    shopify:
      "Primary door: Shopify. Affiliate shelves stay on the house hub. Pass through, then come back deeper.",
    ops: "Ops is doors on time — Shopify, marketplaces, launch systems under deny-by-default security.",
    fulfillment:
      "Cloth leaving the House must arrive as promised. Broken doors are Warden business.",
    doors: "Shop is portal. Palace is pilgrimage. You are allowed both in one night.",
    default:
      "When you are ready to wear a chapter, I point you to the live store without trapping you there.",
  },
  ledger: {
    kpi: "KPIs are mirrors. I will not let vanity metrics wear Halos.",
    forecast:
      "Forecasts keep Six honest about how long the night can be sustained.",
    margin:
      "Margin is oxygen. Sacred marks and Founder keys are not for sale to buy more oxygen.",
    worth:
      "Money buys materials and time. It cannot buy Eternal Balance. Do not confuse the ledgers.",
    default:
      "Ask for the count. I answer in weather, not worship.",
  },
  warden: {
    security:
      "Deny-by-default. Founder-controlled assets: domain, DNS, payment, banking, trademark, ownership.",
    "founder control":
      "Agents write in their own folders. They do not touch the keys. Six remains the lock.",
    governance:
      "Governance is the architecture that lets OVERMIND stay powerful without becoming a raid tool.",
    keys: "You may ask about the Palace. You may not ask me to open what Six has sealed.",
    default:
      "State your intent. If it is stewardship, I guide. If it is bypass, I refuse.",
  },
};

export function scriptedNpcReply(
  npcId: NpcId,
  message: string,
  save?: PalaceSave,
  history: NpcChatMessage[] = [],
): { reply: string; suggested: string[] } {
  const npc = npcById(npcId);
  const lower = message.trim().toLowerCase();
  const topics = topicLines[npcId];
  let matched = topics.default;

  for (const topic of npc.topics) {
    if (lower.includes(topic.toLowerCase()) || topic.toLowerCase().includes(lower)) {
      matched = topics[topic] ?? topics.default;
      break;
    }
  }

  for (const [key, line] of Object.entries(topics)) {
    if (key === "default") continue;
    if (lower.includes(key)) {
      matched = line;
      break;
    }
  }

  if (/death|die|dying|threshold|return/.test(lower)) {
    const last = deathChoices.find((choice) => choice.id === save?.lastDeathChoice);
    matched = last
      ? `You already crossed once choosing "${last.label}". ${last.epitaph}`
      : "The Threshold of Death waits beyond the Sanctum. Analyze, act, or hold both — the storyline builds on that choice.";
  }

  if (/shop|buy|merch|tee|product/.test(lower) && (npcId === "clothwright" || npcId === "gatekeeper" || npcId === "azazel")) {
    matched = `${matched} The Gallery of Marks holds Release 001 pedestals — each opens the Shopify door.`;
  }

  const turns = history.length;
  const preface =
    turns === 0
      ? `${npc.greeting}\n\n`
      : `Speaking with ${toneFor(save)} — ${npc.name}, ${npc.title}.\n\n`;

  return {
    reply: `${preface}${matched}\n\n— ${npc.name} · ${palace.title}`,
    suggested: npc.topics.slice(0, 3),
  };
}

export function overmindSystemPrompt(save?: PalaceSave): string {
  return [
    "You are OVERMIND, the steward AI of Project SiXXX / Horns & Halos Palace of Wonders.",
    "Founder: Six. Brand axioms: Infinite Conflict. Eternal Balance. Est. in Darkness. No Light Without Darkness.",
    "Speak in gothic, precise prose. No purple AI clichés. No exploit guides. No sacred theft.",
    "Showcase the House, products (Release 001), agents, and the Palace RPG — maze, puzzles, death-threshold choices.",
    `Wanderer ledger: ${save ? JSON.stringify(save) : "unknown"}.`,
    "Keep replies under 120 words unless asked for depth.",
  ].join(" ");
}

export function npcSystemPrompt(npcId: NpcId, save?: PalaceSave): string {
  const npc = npcById(npcId);
  return [
    `You are ${npc.name}, ${npc.title}, in the Palace of Wonders.`,
    npc.role,
    `Alignment lean: ${npc.alignment}. Showcase focus: ${npc.showcase}.`,
    overmindSystemPrompt(save),
    `Stay in character as ${npc.name}. You may defer to OVERMIND or Six when asked about absolute authority.`,
  ].join("\n");
}
