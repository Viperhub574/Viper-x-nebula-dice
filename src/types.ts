export type ColorId = 'kirmizi' | 'mavi' | 'yesil' | 'sari' | 'mor' | 'turuncu';

export interface GameColor {
  id: ColorId;
  name: string;
  nameEn: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  glowHex: string;
  textColor: string;
  pips: number; // 1 to 6 for standard dice feel
  bgGradient: string;
  borderClass: string;
}

export const GAME_COLORS: GameColor[] = [
  {
    id: 'kirmizi',
    name: 'Kırmızı',
    nameEn: 'Red',
    hex: '#EF4444',
    darkHex: '#B91C1C',
    lightHex: '#FCA5A5',
    glowHex: 'rgba(239, 68, 68, 0.45)',
    textColor: '#FFFFFF',
    pips: 1,
    bgGradient: 'from-red-500 to-rose-700',
    borderClass: 'border-red-400',
  },
  {
    id: 'mavi',
    name: 'Mavi',
    nameEn: 'Blue',
    hex: '#3B82F6',
    darkHex: '#1D4ED8',
    lightHex: '#93C5FD',
    glowHex: 'rgba(59, 130, 246, 0.45)',
    textColor: '#FFFFFF',
    pips: 2,
    bgGradient: 'from-blue-500 to-indigo-700',
    borderClass: 'border-blue-400',
  },
  {
    id: 'yesil',
    name: 'Yeşil',
    nameEn: 'Green',
    hex: '#10B981',
    darkHex: '#047857',
    lightHex: '#6EE7B7',
    glowHex: 'rgba(16, 185, 129, 0.45)',
    textColor: '#FFFFFF',
    pips: 3,
    bgGradient: 'from-emerald-500 to-teal-700',
    borderClass: 'border-emerald-400',
  },
  {
    id: 'sari',
    name: 'Sarı',
    nameEn: 'Yellow',
    hex: '#F59E0B',
    darkHex: '#B45309',
    lightHex: '#FDE68A',
    glowHex: 'rgba(245, 158, 11, 0.45)',
    textColor: '#1E1E1E',
    pips: 4,
    bgGradient: 'from-amber-400 to-yellow-600',
    borderClass: 'border-amber-400',
  },
  {
    id: 'mor',
    name: 'Mor',
    nameEn: 'Purple',
    hex: '#A855F7',
    darkHex: '#6B21A8',
    lightHex: '#D8B4FE',
    glowHex: 'rgba(168, 85, 247, 0.45)',
    textColor: '#FFFFFF',
    pips: 5,
    bgGradient: 'from-purple-500 to-violet-800',
    borderClass: 'border-purple-400',
  },
  {
    id: 'turuncu',
    name: 'Turuncu',
    nameEn: 'Orange',
    hex: '#F97316',
    darkHex: '#C2410C',
    lightHex: '#FDBA74',
    glowHex: 'rgba(249, 115, 22, 0.45)',
    textColor: '#FFFFFF',
    pips: 6,
    bgGradient: 'from-orange-500 to-amber-700',
    borderClass: 'border-orange-400',
  },
];

export interface RollRecord {
  id: string;
  roundNumber: number;
  diceColors: ColorId[];
  blockedColor: ColorId | null;
  mode: 'free' | 'unique';
  timestamp: number;
  comboLabel?: string;
}

export type RollMode = 'free' | 'unique';
