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
  "Aaron Franklin Brink (November 12, 1974 – May 26, 2023) was a Southern California mixed martial artist known in the cage as “The Frijolero.” Over a professional career that stretched from the late 1990s into the late 2010s, he competed for major promotions including the UFC, WEC, King of the Cage, and RINGS, and fought out of the San Diego area. Aaron was a warrior, a scholar, a role model and a friend. In addition to introducing me to his brother Ryan, his endorsement and support of my work when I was formulating Project Sixxx played an integral role to everything that has followed. He is sorely missed and fondly remembered. If Valhalla exists he surely has a seat at the banquet. May his memory be honored with dignity.";

const pages: Record<string, ArtistPageCopy> = {
  "dean-ryan-brink": {
    kicker: "Collaborator · Southern California",
    profile:
      "Dean Ryan Brink is a Southern California original artist, custom tattoo specialist, musician, and entertainer. Born in Newport Beach and raised in part in Huntington Beach, he studied art in Houston in the late 1990s and later settled in Big Bear Lake, where he built Tat2xtreme Custom Tattoo Studio. His public practice runs from private custom tattoo sessions (including past guest spots at 3 Aces Tattoo in Escondido) to original dark-fantasy painting and heavy music with Atropal. The work is intense — beauty and threat sharing the same surface.",
    skills: [
      {
        title: "Custom tattooing",
        detail:
          "Large-scale color, dark surreal sleeves and body pieces; private studio craft in Big Bear; San Diego–area guest spots.",
      },
      {
        title: "Original 2D / dark-fantasy art",
        detail: "Paintings that push mythic subjects into uncanny, nightmarish forms.",
      },
      {
        title: "Music & performance culture",
        detail:
          "Atropal (modern heavy metal with a thrash core); body-based performance rooted in ritual and modern-primitive practice.",
      },
    ],
    whySelected:
      "Dean's visual language (custom tattoo craft, dark-realism motifs, and original dark-fantasy painting) belongs in Project SiXXX's underground dark-art house. His Southern California roots and his guest work at 3 Aces Tattoo in Escondido tie him naturally to a San Diego gallery.",
    memorial: DEAN_RYAN_BRINK_MEMORIAL,
  },
  "christian-boye-larsen": {
    kicker: "Collaborator · Copenhagen",
    profile:
      "Christian Boye Larsen tattoos as a resident artist at Dropout in Copenhagen, Denmark, and travels for guest spots across the United States, chiefly Las Vegas, New York and New Jersey. The practice centers on freehand dark art and horror monsters in black and grey, drawn on the spot with a method rooted in graffiti. Large projects (sleeves, back pieces, full fronts, leg sleeves) unfold over focused full-day and half-day sessions, so each creature can wrap the body as one composition. The spark traces back to the villains of childhood cartoons, the many-headed and serpentine ones that always looked the coolest.",
    skills: [
      {
        title: "Freehand dark-art tattooing",
        detail: "Designs drawn directly on the skin, shaped to the body in the moment.",
      },
      {
        title: "Horror-monster design",
        detail: "Creature work in black and grey, from serpentine beasts to villainous faces.",
      },
      {
        title: "Large-scale body flow",
        detail: "Sleeves, backs, fronts and leg sleeves composed as single pieces across multi-session projects.",
      },
      {
        title: "Flash",
        detail: "A published set of ready-to-wear designs alongside the custom work.",
      },
    ],
    whySelected:
      "Christian Boye Larsen's monster-driven black and grey, with its playful villain-loving origin, sits naturally beside the Horns side of Project SiXXX. The freehand method, art made live on the body, echoes the house value of creating in the moment.",
  },
  "eliot-kohek": {
    kicker: "Collaborator · Annecy",
    profile:
      "Eliot Kohek has tattooed since 2008 and works from a private studio in Annecy, France, with regular guest spots and conventions. The craft grew through years of close study of paintings, drawings and tattoos, and settled into one specialty: large-scale dark realism. Every piece stays in black and grey, usually built from undiluted black, so the image reads with force from across a room and rewards a closer look with fine detail. Skulls, black magic, gothic architecture and apocalyptic scenes fill the portfolio, each composed to sit as atmosphere on the body.",
    skills: [
      {
        title: "Dark realism",
        detail: "Large-scale black-and-grey work with deep contrast and carefully built texture.",
      },
      {
        title: "Composition for distance",
        detail: "Strong silhouettes and bold blacks that hold their impact at range.",
      },
      {
        title: "Horror and portrait realism",
        detail: "Skulls, figures and faces rendered with charcoal-like depth.",
      },
      {
        title: "Architectural atmosphere",
        detail: "Ruined naves, apocalyptic horizons and ritual scenes that set mood across a whole body area.",
      },
    ],
    whySelected:
      "Eliot Kohek's charcoal-deep blacks and cathedral-scale compositions echo the house mood, Est. in Darkness. The interplay of shadow and a single carved source of light speaks to both sides of the house: Horns in the dark, Halos in the rare light.",
  },
  "jesse-levitt": {
    kicker: "Collaborator · Vermont & Troy, New York",
    profile:
      "Jesse Levitt tattoos and paints abstracted dark art, with every piece conceptualized personally and freehanded onto the skin with markers, on the spot. Fifteen years of work in a single personal style have produced a body of organic, flowing darkness, much of it in black and grey. Jesse's official bio names Burlington, Vermont as home base, with travel for conventions and guest spots across the country and abroad. In 2020 Jesse opened Darkspace Art Collective in downtown Troy, New York, a by-appointment studio with its own gallery room for dark art on canvas as well as skin. Original oil paintings, studies and commissions run alongside the tattoo work.",
    skills: [
      {
        title: "Freehand dark art",
        detail: "Compositions invented on the body in the moment, fully conceived by the artist.",
      },
      {
        title: "Bio-organic abstraction",
        detail: "Flowing, anatomical forms that move with the wearer.",
      },
      {
        title: "Oil painting",
        detail: "Original paintings, small oil studies and commissioned canvases.",
      },
      {
        title: "Studio and gallery building",
        detail: "Darkspace Art Collective, a tattoo studio with a dedicated dark-art gallery and a freehand-first ethos.",
      },
    ],
    whySelected:
      "Darkspace pairs a working studio with a gallery wall, close kin to the Project SiXXX model of gallery, shop and house under one roof. Jesse Levitt's organic, abstract darkness also widens the roster's range beyond figurative horror.",
  },
  "rob-borbas": {
    kicker: "Collaborator · Budapest · Grindesign",
    profile:
      "Róbert Borbás, known as Grindesign, has tattooed since 2012 and runs Rooklet Ink, the Budapest studio opened in 2015. Trained as an animation director at MOME in Budapest, Rob first built a following illustrating for metal bands, including the cover of Soilwork's The Ride Majestic. The tattoo work stays in black and grey: fine black linework and dotwork shading in the lineage of Dürer's engravings and Doré's illustrations, populated by skulls, crows, wolves, goats, mythical creatures and the occult. Two monographs from Tattoo Life gather the work: Ten Years of Grindesign (2020) and INCUBUS – The Art of Grindesign (2025), where the Lidérc, a night demon from Hungarian folklore, takes center stage.",
    skills: [
      {
        title: "Black-and-grey tattooing",
        detail: "Large-scale sleeves, backs and fronts built from fine line and dotwork.",
      },
      {
        title: "Illustration and album art",
        detail: "Covers and merchandise art for metal bands, including Soilwork's The Ride Majestic.",
      },
      {
        title: "Folklore and occult imagery",
        detail: "Ghouls, demons and creatures drawn from Hungarian and Norse folklore.",
      },
      {
        title: "Published monographs",
        detail: "Two books in Tattoo Life's Great Books on the Art of Tattooing series.",
      },
    ],
    whySelected:
      "Rob Borbas's engraving-like line sits squarely in the gothic, old-print atmosphere that Project SiXXX loves. The work moves freely between skin, page and record sleeve, the same range the house spans with journal, gallery and shop.",
  },
};

export function artistPageCopy(slug: string): ArtistPageCopy | undefined {
  return pages[slug];
}
