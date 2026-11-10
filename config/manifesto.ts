/** Horns & Halos / Project SiXXX manifesto — locked house prose. Homepage only. */
export const manifestoTitle = "Manifesto";

/**
 * Authoritative body. Paragraphs are blank-line separated.
 * `**marks**` render as emphasis. Do not invent alternate copy.
 */
export const manifestoSource = `We keep a house where darkness and light share one reality.

**Horns** carry the weight the body already knows — the pull, the hunger, the unfinished sentence. **Halos** hold the light that arrives only after the work: earned, quiet, unbroken.

Between them sits the life we forge and the legacy that remains.

Infinite Conflict. Eternal Balance.

Skulls are the token we leave behind — smiling, empty-eyed, stripped of flesh. Some linger for ages and are found by later hands in fear and wonder. Others return to dust and become the sand. Born of stars or from one another, of light and darkness both — surrounded and held within — they remain the mark of our humanity when the final legacy begins.

Project SiXXX is Est. in Darkness — a date and a discipline. Art, music, film, literature, fashion, and the machines that keep pace with them, gathered under one night. Horns & Halos is the portal into that night: silver for the door, cloth for the chapter, marks you wear when the room goes quiet.

Release 001 is the first chapter cut for the body. Wear what the house believes. The weight, worn.

Sacred marks stay where they belong. The house wears its own skin — atmosphere over clean bone, haunting surface, exact architecture. Fine is a cut: craft before consensus, commerce as weather, seams and sentences that survive when a name goes blank.

No Light Without Darkness. The brighter the flame, the deeper the shadow. We keep both in the same frame.

Welcome to the night.

— Horns & Halos · Project SiXXX`;

export const manifestoAxiom = "Infinite Conflict. Eternal Balance.";
export const manifestoWelcome = "Welcome to the night.";
export const manifestoSignoff = "— Horns & Halos · Project SiXXX";

export function manifestoParagraphs(): string[] {
  return manifestoSource
    .trim()
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
