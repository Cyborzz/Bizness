// Géométrie centralisée du logo (le « mark »).
// Un seul endroit définit la forme : BrandMark (DOM) et tous les
// générateurs d'icônes (favicon, PWA, Apple, OpenGraph via Satori)
// la réutilisent pour rester parfaitement cohérents.
export const GLYPH = {
  viewBox: "0 0 48 48",
  // Tuile arrondie de fond (dégradé encre -> bleu).
  tile: { rx: 13 },
  // Carte blanche intérieure (métaphore « carte de fidélité »).
  card: { x: 9, y: 9, w: 30, h: 30, rx: 9 },
  // « F » de Fidélise, tracé d'un seul trait épais.
  fPath: "M18 16V33M18 16H31M18 24H26",
  fStroke: 5,
  // Tampon / récompense débloquée en bas à droite.
  stamp: { cx: 32, cy: 32, r: 6.5 },
  checkPath: "M29 32.1L31.1 34.3L35 30.1",
  checkStroke: 2.6,
} as const;
