import {
  manifestoAxiom,
  manifestoParagraphs,
  manifestoSignoff,
  manifestoSource,
  manifestoTitle,
  manifestoWelcome,
} from "../config/manifesto";

const skullsStanza =
  "Skulls are the token we leave behind — smiling, empty-eyed, stripped of flesh. Some linger for ages and are found by later hands in fear and wonder. Others return to dust and become the sand. Born of stars or from one another, of light and darkness both — surrounded and held within — they remain the mark of our humanity when the final legacy begins.";

const banned = [
  "is a date, not a filter",
  "We do not steal sacred marks",
  "We do not dress the house",
  "If it needs a costume",
  "share one name",
  "Born of stars or bone",
];

for (const phrase of banned) {
  if (manifestoSource.includes(phrase)) {
    throw new Error(`manifesto must not contain banned copy: ${phrase}`);
  }
}

const required = [
  "We keep a house where darkness and light share one reality.",
  manifestoAxiom,
  skullsStanza,
  "Project SiXXX is Est. in Darkness — a date and a discipline.",
  "Release 001 is the first chapter cut for the body.",
  "Sacred marks stay where they belong.",
  "No Light Without Darkness.",
  manifestoWelcome,
  manifestoSignoff,
];

for (const phrase of required) {
  if (!manifestoSource.includes(phrase)) {
    throw new Error(`manifesto missing locked phrase: ${phrase}`);
  }
}

if (manifestoTitle !== "Manifesto") {
  throw new Error("section title must be Manifesto");
}

const paragraphs = manifestoParagraphs();
if (paragraphs.length !== 11) {
  throw new Error(`expected 11 manifesto paragraphs, got ${paragraphs.length}`);
}
if (paragraphs[0] !== "We keep a house where darkness and light share one reality.") {
  throw new Error("first paragraph drifted");
}
if (paragraphs[4] !== skullsStanza) {
  throw new Error("Skulls stanza must follow Infinite Conflict. Eternal Balance.");
}
if (paragraphs.at(-1) !== manifestoSignoff) {
  throw new Error("signoff must close the manifesto");
}
if (!paragraphs[1].includes("**Horns**") || !paragraphs[1].includes("**Halos**")) {
  throw new Error("Horns and Halos marks must stay in the second paragraph");
}

console.log("manifesto copy ok");
