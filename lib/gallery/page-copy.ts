export type ArtistSkill = {
  title: string;
  detail: string;
};

export type ArtistPageCopy = {
  kicker: string;
  profile: string;
  skills: ArtistSkill[];
  whySelected: string;
  memorial?: string;
};

/**
 * Locked memorial for Dean Ryan Brink’s page.
 * Overmind RE-SCREEN PASS 2026-10-05 — paste verbatim; do not edit a character.
 */
export const DEAN_RYAN_BRINK_MEMORIAL =
  "Aaron Franklin Brink (November 12, 1974 – May 26, 2023) was a Southern California mixed martial artist known in the cage as “The Frijolero.” Over a professional career that stretched from the late 1990s into the late 2010s, he competed for major promotions including the UFC, WEC, King of the Cage, and RINGS, and fought out of the San Diego area. Aaron Franklin Brink is remembered here as well. Aaron was a warrior, a scholar, a role model and a friend. In addition to introducing me to his brother Ryan, his endorsement and support of my work when I was formulating Project Sixxx played an integral role to everything that has followed. He is sorely missed and fondly remembered. If Valhalla exists he surely has a seat at the banquet. May his memory be honored with dignity.";

const pages: Record<string, ArtistPageCopy> = {
  "dean-ryan-brink": {
    kicker: "Collaborator · Southern California",
    profile:
      "Dean Ryan Brink is a Southern California original artist, custom tattoo specialist, musician, and entertainer. Born in Newport Beach and raised in part in Huntington Beach, he studied art in Houston in the late 1990s and later settled in Big Bear Lake, where he built Tat2Xtream / Tat2xtreme Custom Tattoo Studio. His public practice runs from private custom tattoo sessions (including historical guest spotting at 3 Aces Tattoo in Escondido) to original dark-fantasy painting and heavy music with Atropal. The work is intense — beauty and threat sharing the same surface.",
    skills: [
      {
        title: "Custom tattooing",
        detail:
          "Large-scale color, dark surreal sleeves and body pieces; private studio craft in Big Bear; San Diego–area guest history.",
      },
      {
        title: "Original 2D / dark-fantasy art",
        detail: "Paintings that push mythic subjects into uncanny, nightmarish forms.",
      },
      {
        title: "Music & performance culture",
        detail:
          "Atropal (modern heavy metal with a thrash core); body-based performance framed on his site as ritual / modern-primitive practice.",
      },
    ],
    whySelected:
      "[CURATOR INFERENCE] Dean’s public visual language — custom tattoo craft, dark-realism motifs, and original dark-fantasy painting — sits with Project SiXXX’s underground / dark-art house. Southern California roots and Escondido guest history also make a San Diego gallery connection geographically natural. This is a fit judgment from public materials.",
    memorial: DEAN_RYAN_BRINK_MEMORIAL,
  },
};

export function artistPageCopy(slug: string): ArtistPageCopy | undefined {
  return pages[slug];
}
