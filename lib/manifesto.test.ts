import {
  manifestoAxiom,
  manifestoParagraphs,
  manifestoSignoff,
  manifestoSource,
  manifestoTitle,
  manifestoWelcome,
} from "../config/manifesto";

const banned = [
  "is a date, not a filter",
  "We do not steal sacred marks",
  "We do not dress the house",
  "If it needs a costume",
];

for (const phrase of banned) {
  if (manifestoSource.includes(phrase)) {
    throw new Error(`manifesto must not contain banned copy: ${phrase}`);
  }
}

const required = [
  "We keep a house where darkness and light share one name.",
  manifestoAxiom,
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
if (paragraphs.length !== 10) {
  throw new Error(`expected 10 manifesto paragraphs, got ${paragraphs.length}`);
}
if (paragraphs[0] !== "We keep a house where darkness and light share one name.") {
  throw new Error("first paragraph drifted");
}
if (paragraphs.at(-1) !== manifestoSignoff) {
  throw new Error("signoff must close the manifesto");
}
if (!paragraphs[1].includes("**Horns**") || !paragraphs[1].includes("**Halos**")) {
  throw new Error("Horns and Halos marks must stay in the second paragraph");
}

console.log("manifesto copy ok");
