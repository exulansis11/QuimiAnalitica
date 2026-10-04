/**
 * Tabela Periódica - dados completos dos elementos
 */

export interface Element {
  z: number; // Número atômico
  symbol: string;
  name: string;
  nameEn: string;
  atomicMass: number; // u (massa atômica)
  category: ElementCategory;
  group: number | null; // Grupo (1-18) ou null para lantanídeos/actinídeos
  period: number;
  electronConfig: string;
  commonOxidation: string;
  density?: number;
  meltPoint?: number; // K
  boilPoint?: number; // K
  discoveredBy?: string;
  // Coordenadas para visualização em grid
  x: number;
  y: number;
  // Para lantanídeos e actinídeos
  fBlock?: boolean;
}

export type ElementCategory =
  | "alkali-metal" | "alkaline-earth" | "transition-metal" | "post-transition"
  | "metalloid" | "nonmetal" | "halogen" | "noble-gas" | "lanthanide" | "actinide"
  | "unknown";

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  "alkali-metal": "#ff7f7f",
  "alkaline-earth": "#ffd9a0",
  "transition-metal": "#ffe066",
  "post-transition": "#a8e6cf",
  "metalloid": "#bde0fe",
  "nonmetal": "#caffbf",
  "halogen": "#ffc6ff",
  "noble-gas": "#bdb2ff",
  "lanthanide": "#ffadad",
  "actinide": "#ffd6a5",
  "unknown": "#e9ecef",
};

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  "alkali-metal": "Metal Alcalino",
  "alkaline-earth": "Metal Alcalino-Terroso",
  "transition-metal": "Metal de Transição",
  "post-transition": "Metal Pós-Transição",
  "metalloid": "Metaloide",
  "nonmetal": "Não-Metal",
  "halogen": "Halogênio",
  "noble-gas": "Gás Nobre",
  "lanthanide": "Lantanídeo",
  "actinide": "Actinídeo",
  "unknown": "Desconhecido",
};

// Tabela periódica completa (1-118) - coordenadas em grid 18x10 (mais 2 linhas f-block)
export const ELEMENTS: Element[] = [
  // Período 1
  { z: 1, symbol: "H", name: "Hidrogênio", nameEn: "Hydrogen", atomicMass: 1.008, category: "nonmetal", group: 1, period: 1, electronConfig: "1s¹", commonOxidation: "+1, -1", density: 0.00009, meltPoint: 14, boilPoint: 20, discoveredBy: "Cavendish (1766)", x: 1, y: 1 },
  { z: 2, symbol: "He", name: "Hélio", nameEn: "Helium", atomicMass: 4.0026, category: "noble-gas", group: 18, period: 1, electronConfig: "1s²", commonOxidation: "0", density: 0.00018, meltPoint: 1, boilPoint: 4, discoveredBy: "Janssen (1868)", x: 18, y: 1 },
  // Período 2
  { z: 3, symbol: "Li", name: "Lítio", nameEn: "Lithium", atomicMass: 6.94, category: "alkali-metal", group: 1, period: 2, electronConfig: "[He]2s¹", commonOxidation: "+1", density: 0.534, meltPoint: 454, boilPoint: 1615, discoveredBy: "Arfvedson (1817)", x: 1, y: 2 },
  { z: 4, symbol: "Be", name: "Berílio", nameEn: "Beryllium", atomicMass: 9.0122, category: "alkaline-earth", group: 2, period: 2, electronConfig: "[He]2s²", commonOxidation: "+2", density: 1.85, meltPoint: 1560, boilPoint: 2742, discoveredBy: "Vauquelin (1798)", x: 2, y: 2 },
  { z: 5, symbol: "B", name: "Boro", nameEn: "Boron", atomicMass: 10.81, category: "metalloid", group: 13, period: 2, electronConfig: "[He]2s²2p¹", commonOxidation: "+3", density: 2.34, meltPoint: 2349, boilPoint: 4200, discoveredBy: "Davy/Gay-Lussac (1808)", x: 13, y: 2 },
  { z: 6, symbol: "C", name: "Carbono", nameEn: "Carbon", atomicMass: 12.011, category: "nonmetal", group: 14, period: 2, electronConfig: "[He]2s²2p²", commonOxidation: "+4, +2, -4", density: 2.267, meltPoint: 3823, boilPoint: 4098, discoveredBy: "Antiguidade", x: 14, y: 2 },
  { z: 7, symbol: "N", name: "Nitrogênio", nameEn: "Nitrogen", atomicMass: 14.007, category: "nonmetal", group: 15, period: 2, electronConfig: "[He]2s²2p³", commonOxidation: "+5, +3, -3", density: 0.00125, meltPoint: 63, boilPoint: 77, discoveredBy: "Rutherford (1772)", x: 15, y: 2 },
  { z: 8, symbol: "O", name: "Oxigênio", nameEn: "Oxygen", atomicMass: 15.999, category: "nonmetal", group: 16, period: 2, electronConfig: "[He]2s²2p⁴", commonOxidation: "-2", density: 0.00143, meltPoint: 54, boilPoint: 90, discoveredBy: "Priestley/Scheele (1774)", x: 16, y: 2 },
  { z: 9, symbol: "F", name: "Flúor", nameEn: "Fluorine", atomicMass: 18.998, category: "halogen", group: 17, period: 2, electronConfig: "[He]2s²2p⁵", commonOxidation: "-1", density: 0.0017, meltPoint: 53, boilPoint: 85, discoveredBy: "Moissan (1886)", x: 17, y: 2 },
  { z: 10, symbol: "Ne", name: "Neônio", nameEn: "Neon", atomicMass: 20.180, category: "noble-gas", group: 18, period: 2, electronConfig: "[He]2s²2p⁶", commonOxidation: "0", density: 0.0009, meltPoint: 25, boilPoint: 27, discoveredBy: "Ramsay/Travers (1898)", x: 18, y: 2 },
  // Período 3
  { z: 11, symbol: "Na", name: "Sódio", nameEn: "Sodium", atomicMass: 22.990, category: "alkali-metal", group: 1, period: 3, electronConfig: "[Ne]3s¹", commonOxidation: "+1", density: 0.971, meltPoint: 371, boilPoint: 1156, discoveredBy: "Davy (1807)", x: 1, y: 3 },
  { z: 12, symbol: "Mg", name: "Magnésio", nameEn: "Magnesium", atomicMass: 24.305, category: "alkaline-earth", group: 2, period: 3, electronConfig: "[Ne]3s²", commonOxidation: "+2", density: 1.738, meltPoint: 923, boilPoint: 1363, discoveredBy: "Black (1755)", x: 2, y: 3 },
  { z: 13, symbol: "Al", name: "Alumínio", nameEn: "Aluminum", atomicMass: 26.982, category: "post-transition", group: 13, period: 3, electronConfig: "[Ne]3s²3p¹", commonOxidation: "+3", density: 2.70, meltPoint: 933, boilPoint: 2792, discoveredBy: "Ørsted (1825)", x: 13, y: 3 },
  { z: 14, symbol: "Si", name: "Silício", nameEn: "Silicon", atomicMass: 28.085, category: "metalloid", group: 14, period: 3, electronConfig: "[Ne]3s²3p²", commonOxidation: "+4, -4", density: 2.33, meltPoint: 1687, boilPoint: 3538, discoveredBy: "Berzelius (1824)", x: 14, y: 3 },
  { z: 15, symbol: "P", name: "Fósforo", nameEn: "Phosphorus", atomicMass: 30.974, category: "nonmetal", group: 15, period: 3, electronConfig: "[Ne]3s²3p³", commonOxidation: "+5, +3, -3", density: 1.82, meltPoint: 317, boilPoint: 553, discoveredBy: "Brand (1669)", x: 15, y: 3 },
  { z: 16, symbol: "S", name: "Enxofre", nameEn: "Sulfur", atomicMass: 32.06, category: "nonmetal", group: 16, period: 3, electronConfig: "[Ne]3s²3p⁴", commonOxidation: "+6, +4, -2", density: 2.07, meltPoint: 388, boilPoint: 717, discoveredBy: "Antiguidade", x: 16, y: 3 },
  { z: 17, symbol: "Cl", name: "Cloro", nameEn: "Chlorine", atomicMass: 35.45, category: "halogen", group: 17, period: 3, electronConfig: "[Ne]3s²3p⁵", commonOxidation: "+7, +5, +3, +1, -1", density: 0.00321, meltPoint: 172, boilPoint: 239, discoveredBy: "Scheele (1774)", x: 17, y: 3 },
  { z: 18, symbol: "Ar", name: "Argônio", nameEn: "Argon", atomicMass: 39.948, category: "noble-gas", group: 18, period: 3, electronConfig: "[Ne]3s²3p⁶", commonOxidation: "0", density: 0.00178, meltPoint: 84, boilPoint: 87, discoveredBy: "Ramsay (1894)", x: 18, y: 3 },
  // Período 4
  { z: 19, symbol: "K", name: "Potássio", nameEn: "Potassium", atomicMass: 39.098, category: "alkali-metal", group: 1, period: 4, electronConfig: "[Ar]4s¹", commonOxidation: "+1", density: 0.862, meltPoint: 337, boilPoint: 1032, discoveredBy: "Davy (1807)", x: 1, y: 4 },
  { z: 20, symbol: "Ca", name: "Cálcio", nameEn: "Calcium", atomicMass: 40.078, category: "alkaline-earth", group: 2, period: 4, electronConfig: "[Ar]4s²", commonOxidation: "+2", density: 1.55, meltPoint: 1115, boilPoint: 1757, discoveredBy: "Davy (1808)", x: 2, y: 4 },
  { z: 21, symbol: "Sc", name: "Escândio", nameEn: "Scandium", atomicMass: 44.956, category: "transition-metal", group: 3, period: 4, electronConfig: "[Ar]3d¹4s²", commonOxidation: "+3", density: 2.989, meltPoint: 1814, boilPoint: 3109, discoveredBy: "Nilson (1879)", x: 3, y: 4 },
  { z: 22, symbol: "Ti", name: "Titânio", nameEn: "Titanium", atomicMass: 47.867, category: "transition-metal", group: 4, period: 4, electronConfig: "[Ar]3d²4s²", commonOxidation: "+4, +3", density: 4.54, meltPoint: 1933, boilPoint: 3560, discoveredBy: "Gregor (1791)", x: 4, y: 4 },
  { z: 23, symbol: "V", name: "Vanádio", nameEn: "Vanadium", atomicMass: 50.942, category: "transition-metal", group: 5, period: 4, electronConfig: "[Ar]3d³4s²", commonOxidation: "+5, +4, +3, +2", density: 6.11, meltPoint: 2160, boilPoint: 3680, discoveredBy: "del Río (1801)", x: 5, y: 4 },
  { z: 24, symbol: "Cr", name: "Cromo", nameEn: "Chromium", atomicMass: 51.996, category: "transition-metal", group: 6, period: 4, electronConfig: "[Ar]3d⁵4s¹", commonOxidation: "+6, +3, +2", density: 7.15, meltPoint: 2130, boilPoint: 2945, discoveredBy: "Vauquelin (1797)", x: 6, y: 4 },
  { z: 25, symbol: "Mn", name: "Manganês", nameEn: "Manganese", atomicMass: 54.938, category: "transition-metal", group: 7, period: 4, electronConfig: "[Ar]3d⁵4s²", commonOxidation: "+7, +4, +2", density: 7.21, meltPoint: 1519, boilPoint: 2334, discoveredBy: "Gahn (1774)", x: 7, y: 4 },
  { z: 26, symbol: "Fe", name: "Ferro", nameEn: "Iron", atomicMass: 55.845, category: "transition-metal", group: 8, period: 4, electronConfig: "[Ar]3d⁶4s²", commonOxidation: "+3, +2", density: 7.874, meltPoint: 1811, boilPoint: 3134, discoveredBy: "Antiguidade", x: 8, y: 4 },
  { z: 27, symbol: "Co", name: "Cobalto", nameEn: "Cobalt", atomicMass: 58.933, category: "transition-metal", group: 9, period: 4, electronConfig: "[Ar]3d⁷4s²", commonOxidation: "+2, +3", density: 8.9, meltPoint: 1768, boilPoint: 3200, discoveredBy: "Brandt (1735)", x: 9, y: 4 },
  { z: 28, symbol: "Ni", name: "Níquel", nameEn: "Nickel", atomicMass: 58.693, category: "transition-metal", group: 10, period: 4, electronConfig: "[Ar]3d⁸4s²", commonOxidation: "+2, +3", density: 8.908, meltPoint: 1728, boilPoint: 3186, discoveredBy: "Cronstedt (1751)", x: 10, y: 4 },
  { z: 29, symbol: "Cu", name: "Cobre", nameEn: "Copper", atomicMass: 63.546, category: "transition-metal", group: 11, period: 4, electronConfig: "[Ar]3d¹⁰4s¹", commonOxidation: "+2, +1", density: 8.96, meltPoint: 1358, boilPoint: 2835, discoveredBy: "Antiguidade", x: 11, y: 4 },
  { z: 30, symbol: "Zn", name: "Zinco", nameEn: "Zinc", atomicMass: 65.38, category: "transition-metal", group: 12, period: 4, electronConfig: "[Ar]3d¹⁰4s²", commonOxidation: "+2", density: 7.134, meltPoint: 693, boilPoint: 1180, discoveredBy: "Marggraf (1746)", x: 12, y: 4 },
  { z: 31, symbol: "Ga", name: "Gálio", nameEn: "Gallium", atomicMass: 69.723, category: "post-transition", group: 13, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p¹", commonOxidation: "+3", density: 5.91, meltPoint: 303, boilPoint: 2477, discoveredBy: "Boisbaudran (1875)", x: 13, y: 4 },
  { z: 32, symbol: "Ge", name: "Germânio", nameEn: "Germanium", atomicMass: 72.630, category: "metalloid", group: 14, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p²", commonOxidation: "+4, +2", density: 5.323, meltPoint: 1211, boilPoint: 3106, discoveredBy: "Winkler (1886)", x: 14, y: 4 },
  { z: 33, symbol: "As", name: "Arsênio", nameEn: "Arsenic", atomicMass: 74.922, category: "metalloid", group: 15, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p³", commonOxidation: "+5, +3, -3", density: 5.776, meltPoint: 1090, boilPoint: 887, discoveredBy: "Albertus Magnus (1250)", x: 15, y: 4 },
  { z: 34, symbol: "Se", name: "Selênio", nameEn: "Selenium", atomicMass: 78.971, category: "nonmetal", group: 16, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p⁴", commonOxidation: "+6, +4, -2", density: 4.809, meltPoint: 494, boilPoint: 958, discoveredBy: "Berzelius (1817)", x: 16, y: 4 },
  { z: 35, symbol: "Br", name: "Bromo", nameEn: "Bromine", atomicMass: 79.904, category: "halogen", group: 17, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p⁵", commonOxidation: "+7, +5, +1, -1", density: 3.122, meltPoint: 266, boilPoint: 332, discoveredBy: "Balard (1826)", x: 17, y: 4 },
  { z: 36, symbol: "Kr", name: "Criptônio", nameEn: "Krypton", atomicMass: 83.798, category: "noble-gas", group: 18, period: 4, electronConfig: "[Ar]3d¹⁰4s²4p⁶", commonOxidation: "0, +2", density: 0.00375, meltPoint: 116, boilPoint: 120, discoveredBy: "Ramsay/Travers (1898)", x: 18, y: 4 },
  // Período 5
  { z: 37, symbol: "Rb", name: "Rubídio", nameEn: "Rubidium", atomicMass: 85.468, category: "alkali-metal", group: 1, period: 5, electronConfig: "[Kr]5s¹", commonOxidation: "+1", density: 1.532, meltPoint: 312, boilPoint: 961, discoveredBy: "Bunsen/Kirchhoff (1861)", x: 1, y: 5 },
  { z: 38, symbol: "Sr", name: "Estrôncio", nameEn: "Strontium", atomicMass: 87.62, category: "alkaline-earth", group: 2, period: 5, electronConfig: "[Kr]5s²", commonOxidation: "+2", density: 2.64, meltPoint: 1050, boilPoint: 1655, discoveredBy: "Davy (1808)", x: 2, y: 5 },
  { z: 39, symbol: "Y", name: "Ítrio", nameEn: "Yttrium", atomicMass: 88.906, category: "transition-metal", group: 3, period: 5, electronConfig: "[Kr]4d¹5s²", commonOxidation: "+3", density: 4.469, meltPoint: 1799, boilPoint: 3609, discoveredBy: "Gadolin (1794)", x: 3, y: 5 },
  { z: 40, symbol: "Zr", name: "Zircônio", nameEn: "Zirconium", atomicMass: 91.224, category: "transition-metal", group: 4, period: 5, electronConfig: "[Kr]4d²5s²", commonOxidation: "+4", density: 6.506, meltPoint: 2128, boilPoint: 4682, discoveredBy: "Klaproth (1789)", x: 4, y: 5 },
  { z: 41, symbol: "Nb", name: "Nióbio", nameEn: "Niobium", atomicMass: 92.906, category: "transition-metal", group: 5, period: 5, electronConfig: "[Kr]4d⁴5s¹", commonOxidation: "+5, +3", density: 8.57, meltPoint: 2750, boilPoint: 5017, discoveredBy: "Hatchett (1801)", x: 5, y: 5 },
  { z: 42, symbol: "Mo", name: "Molibdênio", nameEn: "Molybdenum", atomicMass: 95.95, category: "transition-metal", group: 6, period: 5, electronConfig: "[Kr]4d⁵5s¹", commonOxidation: "+6, +4", density: 10.22, meltPoint: 2896, boilPoint: 4912, discoveredBy: "Hjelm (1781)", x: 6, y: 5 },
  { z: 43, symbol: "Tc", name: "Tecnécio", nameEn: "Technetium", atomicMass: 98, category: "transition-metal", group: 7, period: 5, electronConfig: "[Kr]4d⁵5s²", commonOxidation: "+7, +4", density: 11.5, meltPoint: 2430, boilPoint: 4538, discoveredBy: "Perrier/Segrè (1937)", x: 7, y: 5 },
  { z: 44, symbol: "Ru", name: "Rutênio", nameEn: "Ruthenium", atomicMass: 101.07, category: "transition-metal", group: 8, period: 5, electronConfig: "[Kr]4d⁷5s¹", commonOxidation: "+4, +3", density: 12.37, meltPoint: 2607, boilPoint: 4423, discoveredBy: "Klaus (1844)", x: 8, y: 5 },
  { z: 45, symbol: "Rh", name: "Ródio", nameEn: "Rhodium", atomicMass: 102.91, category: "transition-metal", group: 9, period: 5, electronConfig: "[Kr]4d⁸5s¹", commonOxidation: "+3", density: 12.41, meltPoint: 2237, boilPoint: 3968, discoveredBy: "Wollaston (1804)", x: 9, y: 5 },
  { z: 46, symbol: "Pd", name: "Paládio", nameEn: "Palladium", atomicMass: 106.42, category: "transition-metal", group: 10, period: 5, electronConfig: "[Kr]4d¹⁰", commonOxidation: "+2, +4", density: 12.02, meltPoint: 1828, boilPoint: 3236, discoveredBy: "Wollaston (1803)", x: 10, y: 5 },
  { z: 47, symbol: "Ag", name: "Prata", nameEn: "Silver", atomicMass: 107.87, category: "transition-metal", group: 11, period: 5, electronConfig: "[Kr]4d¹⁰5s¹", commonOxidation: "+1", density: 10.501, meltPoint: 1235, boilPoint: 2435, discoveredBy: "Antiguidade", x: 11, y: 5 },
  { z: 48, symbol: "Cd", name: "Cádmio", nameEn: "Cadmium", atomicMass: 112.41, category: "transition-metal", group: 12, period: 5, electronConfig: "[Kr]4d¹⁰5s²", commonOxidation: "+2", density: 8.69, meltPoint: 594, boilPoint: 1040, discoveredBy: "Stromeyer (1817)", x: 12, y: 5 },
  { z: 49, symbol: "In", name: "Índio", nameEn: "Indium", atomicMass: 114.82, category: "post-transition", group: 13, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p¹", commonOxidation: "+3", density: 7.31, meltPoint: 430, boilPoint: 2345, discoveredBy: "Reich/Richter (1863)", x: 13, y: 5 },
  { z: 50, symbol: "Sn", name: "Estanho", nameEn: "Tin", atomicMass: 118.71, category: "post-transition", group: 14, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p²", commonOxidation: "+4, +2", density: 7.287, meltPoint: 505, boilPoint: 2875, discoveredBy: "Antiguidade", x: 14, y: 5 },
  { z: 51, symbol: "Sb", name: "Antimônio", nameEn: "Antimony", atomicMass: 121.76, category: "metalloid", group: 15, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p³", commonOxidation: "+5, +3, -3", density: 6.685, meltPoint: 904, boilPoint: 1860, discoveredBy: "Antiguidade", x: 15, y: 5 },
  { z: 52, symbol: "Te", name: "Telúrio", nameEn: "Tellurium", atomicMass: 127.60, category: "metalloid", group: 16, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p⁴", commonOxidation: "+6, +4, -2", density: 6.232, meltPoint: 723, boilPoint: 1261, discoveredBy: "Müller (1782)", x: 16, y: 5 },
  { z: 53, symbol: "I", name: "Iodo", nameEn: "Iodine", atomicMass: 126.90, category: "halogen", group: 17, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p⁵", commonOxidation: "+7, +5, +1, -1", density: 4.93, meltPoint: 387, boilPoint: 457, discoveredBy: "Courtois (1811)", x: 17, y: 5 },
  { z: 54, symbol: "Xe", name: "Xenônio", nameEn: "Xenon", atomicMass: 131.29, category: "noble-gas", group: 18, period: 5, electronConfig: "[Kr]4d¹⁰5s²5p⁶", commonOxidation: "0, +2, +4, +6", density: 0.00588, meltPoint: 161, boilPoint: 165, discoveredBy: "Ramsay/Travers (1898)", x: 18, y: 5 },
  // Período 6
  { z: 55, symbol: "Cs", name: "Césio", nameEn: "Cesium", atomicMass: 132.91, category: "alkali-metal", group: 1, period: 6, electronConfig: "[Xe]6s¹", commonOxidation: "+1", density: 1.93, meltPoint: 302, boilPoint: 944, discoveredBy: "Bunsen/Kirchhoff (1860)", x: 1, y: 6 },
  { z: 56, symbol: "Ba", name: "Bário", nameEn: "Barium", atomicMass: 137.33, category: "alkaline-earth", group: 2, period: 6, electronConfig: "[Xe]6s²", commonOxidation: "+2", density: 3.51, meltPoint: 1000, boilPoint: 2170, discoveredBy: "Davy (1808)", x: 2, y: 6 },
  { z: 57, symbol: "La", name: "Lantânio", nameEn: "Lanthanum", atomicMass: 138.91, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]5d¹6s²", commonOxidation: "+3", density: 6.145, meltPoint: 1193, boilPoint: 3737, discoveredBy: "Mosander (1839)", x: 3, y: 9, fBlock: true },
  { z: 58, symbol: "Ce", name: "Cério", nameEn: "Cerium", atomicMass: 140.12, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹5d¹6s²", commonOxidation: "+4, +3", density: 6.77, meltPoint: 1068, boilPoint: 3716, discoveredBy: "Berzelius (1803)", x: 4, y: 9, fBlock: true },
  { z: 59, symbol: "Pr", name: "Praseodímio", nameEn: "Praseodymium", atomicMass: 140.91, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f³6s²", commonOxidation: "+3", density: 6.773, meltPoint: 1208, boilPoint: 3793, discoveredBy: "Auer (1885)", x: 5, y: 9, fBlock: true },
  { z: 60, symbol: "Nd", name: "Neodímio", nameEn: "Neodymium", atomicMass: 144.24, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁴6s²", commonOxidation: "+3", density: 7.007, meltPoint: 1297, boilPoint: 3347, discoveredBy: "Auer (1885)", x: 6, y: 9, fBlock: true },
  { z: 61, symbol: "Pm", name: "Promécio", nameEn: "Promethium", atomicMass: 145, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁵6s²", commonOxidation: "+3", density: 7.26, meltPoint: 1315, boilPoint: 3273, discoveredBy: "Marinsky (1945)", x: 7, y: 9, fBlock: true },
  { z: 62, symbol: "Sm", name: "Samário", nameEn: "Samarium", atomicMass: 150.36, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁶6s²", commonOxidation: "+3, +2", density: 7.52, meltPoint: 1345, boilPoint: 2067, discoveredBy: "Boisbaudran (1879)", x: 8, y: 9, fBlock: true },
  { z: 63, symbol: "Eu", name: "Európio", nameEn: "Europium", atomicMass: 151.96, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁷6s²", commonOxidation: "+3, +2", density: 5.243, meltPoint: 1099, boilPoint: 1802, discoveredBy: "Demarçay (1901)", x: 9, y: 9, fBlock: true },
  { z: 64, symbol: "Gd", name: "Gadolínio", nameEn: "Gadolinium", atomicMass: 157.25, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁷5d¹6s²", commonOxidation: "+3", density: 7.895, meltPoint: 1585, boilPoint: 3546, discoveredBy: "Marignac (1880)", x: 10, y: 9, fBlock: true },
  { z: 65, symbol: "Tb", name: "Térbio", nameEn: "Terbium", atomicMass: 158.93, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f⁹6s²", commonOxidation: "+3", density: 8.229, meltPoint: 1629, boilPoint: 3503, discoveredBy: "Mosander (1843)", x: 11, y: 9, fBlock: true },
  { z: 66, symbol: "Dy", name: "Disprósio", nameEn: "Dysprosium", atomicMass: 162.50, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹⁰6s²", commonOxidation: "+3", density: 8.55, meltPoint: 1680, boilPoint: 2840, discoveredBy: "Boisbaudran (1886)", x: 12, y: 9, fBlock: true },
  { z: 67, symbol: "Ho", name: "Hólmio", nameEn: "Holmium", atomicMass: 164.93, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹¹6s²", commonOxidation: "+3", density: 8.795, meltPoint: 1734, boilPoint: 2993, discoveredBy: "Cleve (1878)", x: 13, y: 9, fBlock: true },
  { z: 68, symbol: "Er", name: "Érbio", nameEn: "Erbium", atomicMass: 167.26, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹²6s²", commonOxidation: "+3", density: 9.066, meltPoint: 1802, boilPoint: 3141, discoveredBy: "Mosander (1843)", x: 14, y: 9, fBlock: true },
  { z: 69, symbol: "Tm", name: "Túlio", nameEn: "Thulium", atomicMass: 168.93, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹³6s²", commonOxidation: "+3", density: 9.321, meltPoint: 1818, boilPoint: 2223, discoveredBy: "Cleve (1879)", x: 15, y: 9, fBlock: true },
  { z: 70, symbol: "Yb", name: "Itérbio", nameEn: "Ytterbium", atomicMass: 173.05, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹⁴6s²", commonOxidation: "+3, +2", density: 6.965, meltPoint: 1097, boilPoint: 1469, discoveredBy: "Marignac (1878)", x: 16, y: 9, fBlock: true },
  { z: 71, symbol: "Lu", name: "Lutécio", nameEn: "Lutetium", atomicMass: 174.97, category: "lanthanide", group: null, period: 6, electronConfig: "[Xe]4f¹⁴5d¹6s²", commonOxidation: "+3", density: 9.84, meltPoint: 1925, boilPoint: 3675, discoveredBy: "Urbain (1907)", x: 17, y: 9, fBlock: true },
  { z: 72, symbol: "Hf", name: "Háfnio", nameEn: "Hafnium", atomicMass: 178.49, category: "transition-metal", group: 4, period: 6, electronConfig: "[Xe]4f¹⁴5d²6s²", commonOxidation: "+4", density: 13.31, meltPoint: 2506, boilPoint: 4876, discoveredBy: "Coster/Hevesy (1923)", x: 4, y: 6 },
  { z: 73, symbol: "Ta", name: "Tântalo", nameEn: "Tantalum", atomicMass: 180.95, category: "transition-metal", group: 5, period: 6, electronConfig: "[Xe]4f¹⁴5d³6s²", commonOxidation: "+5", density: 16.654, meltPoint: 3290, boilPoint: 5731, discoveredBy: "Ekeberg (1802)", x: 5, y: 6 },
  { z: 74, symbol: "W", name: "Tungstênio", nameEn: "Tungsten", atomicMass: 183.84, category: "transition-metal", group: 6, period: 6, electronConfig: "[Xe]4f¹⁴5d⁴6s²", commonOxidation: "+6, +4", density: 19.25, meltPoint: 3695, boilPoint: 5828, discoveredBy: "Elhuyar (1783)", x: 6, y: 6 },
  { z: 75, symbol: "Re", name: "Rênio", nameEn: "Rhenium", atomicMass: 186.21, category: "transition-metal", group: 7, period: 6, electronConfig: "[Xe]4f¹⁴5d⁵6s²", commonOxidation: "+7, +4", density: 21.02, meltPoint: 3459, boilPoint: 5869, discoveredBy: "Noddack (1925)", x: 7, y: 6 },
  { z: 76, symbol: "Os", name: "Ósmio", nameEn: "Osmium", atomicMass: 190.23, category: "transition-metal", group: 8, period: 6, electronConfig: "[Xe]4f¹⁴5d⁶6s²", commonOxidation: "+4, +3", density: 22.59, meltPoint: 3306, boilPoint: 5285, discoveredBy: "Tennant (1803)", x: 8, y: 6 },
  { z: 77, symbol: "Ir", name: "Irídio", nameEn: "Iridium", atomicMass: 192.22, category: "transition-metal", group: 9, period: 6, electronConfig: "[Xe]4f¹⁴5d⁷6s²", commonOxidation: "+4, +3", density: 22.56, meltPoint: 2719, boilPoint: 4701, discoveredBy: "Tennant (1803)", x: 9, y: 6 },
  { z: 78, symbol: "Pt", name: "Platina", nameEn: "Platinum", atomicMass: 195.08, category: "transition-metal", group: 10, period: 6, electronConfig: "[Xe]4f¹⁴5d⁹6s¹", commonOxidation: "+4, +2", density: 21.45, meltPoint: 2041, boilPoint: 4098, discoveredBy: "Ulloa (1748)", x: 10, y: 6 },
  { z: 79, symbol: "Au", name: "Ouro", nameEn: "Gold", atomicMass: 196.97, category: "transition-metal", group: 11, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s¹", commonOxidation: "+3, +1", density: 19.282, meltPoint: 1337, boilPoint: 3129, discoveredBy: "Antiguidade", x: 11, y: 6 },
  { z: 80, symbol: "Hg", name: "Mercúrio", nameEn: "Mercury", atomicMass: 200.59, category: "transition-metal", group: 12, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²", commonOxidation: "+2, +1", density: 13.5336, meltPoint: 234, boilPoint: 630, discoveredBy: "Antiguidade", x: 12, y: 6 },
  { z: 81, symbol: "Tl", name: "Tálio", nameEn: "Thallium", atomicMass: 204.38, category: "post-transition", group: 13, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p¹", commonOxidation: "+3, +1", density: 11.85, meltPoint: 577, boilPoint: 1746, discoveredBy: "Crookes (1861)", x: 13, y: 6 },
  { z: 82, symbol: "Pb", name: "Chumbo", nameEn: "Lead", atomicMass: 207.2, category: "post-transition", group: 14, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p²", commonOxidation: "+4, +2", density: 11.342, meltPoint: 600, boilPoint: 2022, discoveredBy: "Antiguidade", x: 14, y: 6 },
  { z: 83, symbol: "Bi", name: "Bismuto", nameEn: "Bismuth", atomicMass: 208.98, category: "post-transition", group: 15, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p³", commonOxidation: "+3, +5", density: 9.807, meltPoint: 544, boilPoint: 1837, discoveredBy: "Geoffroy (1753)", x: 15, y: 6 },
  { z: 84, symbol: "Po", name: "Polônio", nameEn: "Polonium", atomicMass: 209, category: "post-transition", group: 16, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p⁴", commonOxidation: "+4, +2, -2", density: 9.32, meltPoint: 527, boilPoint: 1235, discoveredBy: "Curie (1898)", x: 16, y: 6 },
  { z: 85, symbol: "At", name: "Astato", nameEn: "Astatine", atomicMass: 210, category: "halogen", group: 17, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p⁵", commonOxidation: "+1, -1", density: 7, meltPoint: 575, boilPoint: 610, discoveredBy: "Corson (1940)", x: 17, y: 6 },
  { z: 86, symbol: "Rn", name: "Radônio", nameEn: "Radon", atomicMass: 222, category: "noble-gas", group: 18, period: 6, electronConfig: "[Xe]4f¹⁴5d¹⁰6s²6p⁶", commonOxidation: "0, +2", density: 0.00973, meltPoint: 202, boilPoint: 211, discoveredBy: "Dorn (1900)", x: 18, y: 6 },
  // Período 7
  { z: 87, symbol: "Fr", name: "Frâncio", nameEn: "Francium", atomicMass: 223, category: "alkali-metal", group: 1, period: 7, electronConfig: "[Rn]7s¹", commonOxidation: "+1", density: 1.87, meltPoint: 300, boilPoint: 950, discoveredBy: "Perey (1939)", x: 1, y: 7 },
  { z: 88, symbol: "Ra", name: "Rádio", nameEn: "Radium", atomicMass: 226, category: "alkaline-earth", group: 2, period: 7, electronConfig: "[Rn]7s²", commonOxidation: "+2", density: 5.5, meltPoint: 973, boilPoint: 2010, discoveredBy: "Curie (1898)", x: 2, y: 7 },
  { z: 89, symbol: "Ac", name: "Actínio", nameEn: "Actinium", atomicMass: 227, category: "actinide", group: null, period: 7, electronConfig: "[Rn]6d¹7s²", commonOxidation: "+3", density: 10.07, meltPoint: 1323, boilPoint: 3471, discoveredBy: "Debierne (1899)", x: 3, y: 10, fBlock: true },
  { z: 90, symbol: "Th", name: "Tório", nameEn: "Thorium", atomicMass: 232.04, category: "actinide", group: null, period: 7, electronConfig: "[Rn]6d²7s²", commonOxidation: "+4", density: 11.72, meltPoint: 2115, boilPoint: 5061, discoveredBy: "Berzelius (1829)", x: 4, y: 10, fBlock: true },
  { z: 91, symbol: "Pa", name: "Protactínio", nameEn: "Protactinium", atomicMass: 231.04, category: "actinide", group: null, period: 7, electronConfig: "[Rn]4f²6d¹7s²", commonOxidation: "+5", density: 15.37, meltPoint: 1841, boilPoint: 4300, discoveredBy: "Hahn/Meitner (1917)", x: 5, y: 10, fBlock: true },
  { z: 92, symbol: "U", name: "Urânio", nameEn: "Uranium", atomicMass: 238.03, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f³6d¹7s²", commonOxidation: "+6, +4", density: 18.95, meltPoint: 1405, boilPoint: 4404, discoveredBy: "Klaproth (1789)", x: 6, y: 10, fBlock: true },
  { z: 93, symbol: "Np", name: "Neptúnio", nameEn: "Neptunium", atomicMass: 237, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f⁴6d¹7s²", commonOxidation: "+5, +4, +3", density: 20.45, meltPoint: 917, boilPoint: 4273, discoveredBy: "McMillan (1940)", x: 7, y: 10, fBlock: true },
  { z: 94, symbol: "Pu", name: "Plutônio", nameEn: "Plutonium", atomicMass: 244, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f⁶7s²", commonOxidation: "+4, +3", density: 19.84, meltPoint: 913, boilPoint: 3501, discoveredBy: "Seaborg (1940)", x: 8, y: 10, fBlock: true },
  { z: 95, symbol: "Am", name: "Amerício", nameEn: "Americium", atomicMass: 243, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f⁷7s²", commonOxidation: "+3", density: 13.69, meltPoint: 1449, boilPoint: 2880, discoveredBy: "Seaborg (1944)", x: 9, y: 10, fBlock: true },
  { z: 96, symbol: "Cm", name: "Cúrio", nameEn: "Curium", atomicMass: 247, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f⁷6d¹7s²", commonOxidation: "+3", density: 13.51, meltPoint: 1618, boilPoint: 3383, discoveredBy: "Seaborg (1944)", x: 10, y: 10, fBlock: true },
  { z: 97, symbol: "Bk", name: "Berquélio", nameEn: "Berkelium", atomicMass: 247, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f⁹7s²", commonOxidation: "+3", density: 14.78, meltPoint: 1259, boilPoint: 2900, discoveredBy: "Seaborg (1949)", x: 11, y: 10, fBlock: true },
  { z: 98, symbol: "Cf", name: "Califórnio", nameEn: "Californium", atomicMass: 251, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹⁰7s²", commonOxidation: "+3", density: 15.1, meltPoint: 1173, boilPoint: 1743, discoveredBy: "Seaborg (1950)", x: 12, y: 10, fBlock: true },
  { z: 99, symbol: "Es", name: "Einstênio", nameEn: "Einsteinium", atomicMass: 252, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹¹7s²", commonOxidation: "+3", density: 8.84, meltPoint: 1133, boilPoint: 1269, discoveredBy: "Ghiorso (1952)", x: 13, y: 10, fBlock: true },
  { z: 100, symbol: "Fm", name: "Férmio", nameEn: "Fermium", atomicMass: 257, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹²7s²", commonOxidation: "+3", density: 9.7, meltPoint: 1800, discoveredBy: "Ghiorso (1953)", x: 14, y: 10, fBlock: true },
  { z: 101, symbol: "Md", name: "Mendelévio", nameEn: "Mendelevium", atomicMass: 258, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹³7s²", commonOxidation: "+3, +2", density: 10.3, meltPoint: 1100, discoveredBy: "Ghiorso (1955)", x: 15, y: 10, fBlock: true },
  { z: 102, symbol: "No", name: "Nobélio", nameEn: "Nobelium", atomicMass: 259, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹⁴7s²", commonOxidation: "+3, +2", density: 9.9, meltPoint: 1100, discoveredBy: "Ghiorso (1958)", x: 16, y: 10, fBlock: true },
  { z: 103, symbol: "Lr", name: "Laurencio", nameEn: "Lawrencium", atomicMass: 266, category: "actinide", group: null, period: 7, electronConfig: "[Rn]5f¹⁴7s²7p¹", commonOxidation: "+3", density: 15.6, meltPoint: 1900, discoveredBy: "Ghiorso (1961)", x: 17, y: 10, fBlock: true },
  { z: 104, symbol: "Rf", name: "Ruterfórdio", nameEn: "Rutherfordium", atomicMass: 267, category: "transition-metal", group: 4, period: 7, electronConfig: "[Rn]5f¹⁴6d²7s²", commonOxidation: "+4", x: 4, y: 7 },
  { z: 105, symbol: "Db", name: "Dúbnio", nameEn: "Dubnium", atomicMass: 268, category: "transition-metal", group: 5, period: 7, electronConfig: "[Rn]5f¹⁴6d³7s²", commonOxidation: "+5", x: 5, y: 7 },
  { z: 106, symbol: "Sg", name: "Seabórgio", nameEn: "Seaborgium", atomicMass: 269, category: "transition-metal", group: 6, period: 7, electronConfig: "[Rn]5f¹⁴6d⁴7s²", commonOxidation: "+6", x: 6, y: 7 },
  { z: 107, symbol: "Bh", name: "Bório", nameEn: "Bohrium", atomicMass: 270, category: "transition-metal", group: 7, period: 7, electronConfig: "[Rn]5f¹⁴6d⁵7s²", commonOxidation: "+7", x: 7, y: 7 },
  { z: 108, symbol: "Hs", name: "Hássio", nameEn: "Hassium", atomicMass: 269, category: "transition-metal", group: 8, period: 7, electronConfig: "[Rn]5f¹⁴6d⁶7s²", commonOxidation: "+8", x: 8, y: 7 },
  { z: 109, symbol: "Mt", name: "Meitnério", nameEn: "Meitnerium", atomicMass: 278, category: "transition-metal", group: 9, period: 7, electronConfig: "[Rn]5f¹⁴6d⁷7s²", commonOxidation: "+6, +4", x: 9, y: 7 },
  { z: 110, symbol: "Ds", name: "Darmstádio", nameEn: "Darmstadtium", atomicMass: 281, category: "transition-metal", group: 10, period: 7, electronConfig: "[Rn]5f¹⁴6d⁸7s²", commonOxidation: "+4, +2", x: 10, y: 7 },
  { z: 111, symbol: "Rg", name: "Roentgênio", nameEn: "Roentgenium", atomicMass: 282, category: "transition-metal", group: 11, period: 7, electronConfig: "[Rn]5f¹⁴6d⁹7s²", commonOxidation: "+3, +1", x: 11, y: 7 },
  { z: 112, symbol: "Cn", name: "Copernício", nameEn: "Copernicium", atomicMass: 285, category: "transition-metal", group: 12, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²", commonOxidation: "+2", x: 12, y: 7 },
  { z: 113, symbol: "Nh", name: "Nihônio", nameEn: "Nihonium", atomicMass: 286, category: "post-transition", group: 13, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p¹", commonOxidation: "+1", x: 13, y: 7 },
  { z: 114, symbol: "Fl", name: "Fleróvio", nameEn: "Flerovium", atomicMass: 289, category: "post-transition", group: 14, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p²", commonOxidation: "+2", x: 14, y: 7 },
  { z: 115, symbol: "Mc", name: "Moscóvio", nameEn: "Moscovium", atomicMass: 290, category: "post-transition", group: 15, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p³", commonOxidation: "+1, +3", x: 15, y: 7 },
  { z: 116, symbol: "Lv", name: "Livermório", nameEn: "Livermorium", atomicMass: 293, category: "post-transition", group: 16, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p⁴", commonOxidation: "+2", x: 16, y: 7 },
  { z: 117, symbol: "Ts", name: "Tenesso", nameEn: "Tennessine", atomicMass: 294, category: "halogen", group: 17, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p⁵", commonOxidation: "+1, -1", x: 17, y: 7 },
  { z: 118, symbol: "Og", name: "Oganessônio", nameEn: "Oganesson", atomicMass: 294, category: "noble-gas", group: 18, period: 7, electronConfig: "[Rn]5f¹⁴6d¹⁰7s²7p⁶", commonOxidation: "0", x: 18, y: 7 },
];


export const ELEMENTS_BY_SYMBOL: Record<string, Element> = Object.fromEntries(ELEMENTS.map((e) => [e.symbol, e]));
