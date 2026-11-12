export const palacePalette = {
  void: "#050505",
  obsidian: "#0B0B0C",
  horn: "#1A1612",
  ridge: "#3A322C",
  bone: "#E8E2D6",
  ash: "#8A8494",
  crimson: "#6B1C1C",
  ember: "#C45C26",
  silver: "#C7CCD4",
  halo: "#C9C2B0",
  gild: "#A68B4B",
  gold: "#E8D16B",
} as const;

export function moodEmissive(mood: string): string {
  switch (mood) {
    case "horns":
      return palacePalette.crimson;
    case "halos":
      return palacePalette.silver;
    case "liminal":
      return palacePalette.gold;
    case "forge":
      return palacePalette.gild;
    default:
      return palacePalette.ash;
  }
}
