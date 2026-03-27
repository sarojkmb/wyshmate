import type { CSSProperties } from 'react';

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export type BoardTheme = {
  key: 'confetti-pop' | 'soft-harbor' | 'golden-glow' | 'midnight-spark';
  name: string;
  emoji: string;
  heroLabel: string;
  description: string;
  heroGradient: string;
  heroShadow: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  shellStyle: ThemeStyle;
};

const themes: Record<BoardTheme['key'], BoardTheme> = {
  'confetti-pop': {
    key: 'confetti-pop',
    name: 'Confetti Pop',
    emoji: '🎉',
    heroLabel: 'Confetti board',
    description: 'Bright, playful, and perfect for a lively celebration.',
    heroGradient:
      'linear-gradient(135deg, rgba(255, 133, 102, 0.98), rgba(255, 198, 112, 0.96) 48%, rgba(255, 111, 145, 0.94))',
    heroShadow: '0 28px 70px rgba(255, 139, 103, 0.28)',
    accent: '#ff7a59',
    accentSoft: 'rgba(255, 122, 89, 0.14)',
    accentStrong: '#cc5c41',
    shellStyle: {
      '--theme-card-top': 'rgba(255, 255, 255, 0.9)',
      '--theme-card-bottom': 'rgba(255, 248, 242, 0.94)',
      '--theme-card-border': 'rgba(255, 145, 102, 0.18)',
      '--theme-card-shadow': '0 28px 65px rgba(255, 146, 104, 0.13)',
      '--theme-orb-a': 'rgba(255, 175, 112, 0.18)',
      '--theme-orb-b': 'rgba(255, 105, 145, 0.14)',
      '--theme-radial-a': 'rgba(255, 199, 138, 0.34)',
      '--theme-radial-b': 'rgba(255, 121, 166, 0.12)',
      '--theme-top': '#fff7f0',
      '--theme-mid': '#fff8ef',
      '--theme-bottom': '#fffdf8',
    },
  },
  'soft-harbor': {
    key: 'soft-harbor',
    name: 'Soft Harbor',
    emoji: '💼',
    heroLabel: 'Harbor board',
    description: 'Calm, gentle, and ideal for heartfelt goodbyes.',
    heroGradient:
      'linear-gradient(135deg, rgba(110, 143, 153, 0.97), rgba(160, 192, 187, 0.95) 52%, rgba(221, 202, 184, 0.96))',
    heroShadow: '0 28px 70px rgba(118, 146, 150, 0.2)',
    accent: '#5f7f87',
    accentSoft: 'rgba(95, 127, 135, 0.13)',
    accentStrong: '#486168',
    shellStyle: {
      '--theme-card-top': 'rgba(255, 255, 255, 0.88)',
      '--theme-card-bottom': 'rgba(246, 250, 249, 0.94)',
      '--theme-card-border': 'rgba(114, 145, 146, 0.17)',
      '--theme-card-shadow': '0 28px 65px rgba(109, 137, 143, 0.1)',
      '--theme-orb-a': 'rgba(179, 208, 202, 0.16)',
      '--theme-orb-b': 'rgba(221, 202, 184, 0.14)',
      '--theme-radial-a': 'rgba(181, 212, 205, 0.28)',
      '--theme-radial-b': 'rgba(151, 181, 185, 0.12)',
      '--theme-top': '#f5faf9',
      '--theme-mid': '#f6fbfb',
      '--theme-bottom': '#fcfcfa',
    },
  },
  'golden-glow': {
    key: 'golden-glow',
    name: 'Golden Glow',
    emoji: '✨',
    heroLabel: 'Glow board',
    description: 'Warm, polished, and ready for almost any occasion.',
    heroGradient:
      'linear-gradient(135deg, rgba(86, 95, 122, 0.97), rgba(146, 131, 111, 0.95) 52%, rgba(221, 196, 154, 0.95))',
    heroShadow: '0 28px 70px rgba(110, 102, 101, 0.18)',
    accent: '#8f6d42',
    accentSoft: 'rgba(143, 109, 66, 0.12)',
    accentStrong: '#6f5330',
    shellStyle: {
      '--theme-card-top': 'rgba(255, 255, 255, 0.88)',
      '--theme-card-bottom': 'rgba(251, 249, 245, 0.95)',
      '--theme-card-border': 'rgba(154, 132, 100, 0.16)',
      '--theme-card-shadow': '0 28px 65px rgba(130, 110, 88, 0.1)',
      '--theme-orb-a': 'rgba(221, 196, 154, 0.15)',
      '--theme-orb-b': 'rgba(133, 143, 168, 0.12)',
      '--theme-radial-a': 'rgba(225, 210, 180, 0.26)',
      '--theme-radial-b': 'rgba(119, 129, 152, 0.12)',
      '--theme-top': '#fbf8f1',
      '--theme-mid': '#fcfaf5',
      '--theme-bottom': '#fffdf9',
    },
  },
  'midnight-spark': {
    key: 'midnight-spark',
    name: 'Midnight Spark',
    emoji: '🌙',
    heroLabel: 'Midnight board',
    description: 'Moody, dramatic, and a little more cinematic.',
    heroGradient:
      'linear-gradient(135deg, rgba(36, 45, 76, 0.98), rgba(91, 76, 132, 0.96) 50%, rgba(241, 142, 117, 0.92))',
    heroShadow: '0 28px 70px rgba(52, 48, 95, 0.22)',
    accent: '#f18e75',
    accentSoft: 'rgba(241, 142, 117, 0.14)',
    accentStrong: '#d86e57',
    shellStyle: {
      '--theme-card-top': 'rgba(255, 255, 255, 0.9)',
      '--theme-card-bottom': 'rgba(248, 246, 255, 0.94)',
      '--theme-card-border': 'rgba(108, 94, 164, 0.18)',
      '--theme-card-shadow': '0 28px 65px rgba(64, 59, 112, 0.12)',
      '--theme-orb-a': 'rgba(241, 142, 117, 0.14)',
      '--theme-orb-b': 'rgba(105, 89, 168, 0.14)',
      '--theme-radial-a': 'rgba(241, 162, 129, 0.22)',
      '--theme-radial-b': 'rgba(108, 98, 176, 0.16)',
      '--theme-top': '#f6f4ff',
      '--theme-mid': '#faf8ff',
      '--theme-bottom': '#fffdfb',
    },
  },
};

export const themeOptions: Array<{ value: BoardTheme['key']; label: string; emoji: string }> = [
  { value: 'confetti-pop', label: 'Confetti Pop', emoji: '🎉' },
  { value: 'soft-harbor', label: 'Soft Harbor', emoji: '💼' },
  { value: 'golden-glow', label: 'Golden Glow', emoji: '✨' },
  { value: 'midnight-spark', label: 'Midnight Spark', emoji: '🌙' },
];

export const deriveThemeFromOccasion = (occasion?: string | null): BoardTheme['key'] => {
  const normalized = occasion?.trim().toLowerCase();

  if (normalized === 'birthday') {
    return 'confetti-pop';
  }

  if (normalized === 'farewell') {
    return 'soft-harbor';
  }

  return 'golden-glow';
};

export const getBoardTheme = (theme?: string | null, occasion?: string | null): BoardTheme => {
  const normalizedTheme = theme?.trim().toLowerCase();

  if (normalizedTheme === 'birthday' || normalizedTheme === 'confetti-pop') {
    return themes['confetti-pop'];
  }

  if (normalizedTheme === 'farewell' || normalizedTheme === 'soft-harbor') {
    return themes['soft-harbor'];
  }

  if (normalizedTheme === 'celebration' || normalizedTheme === 'golden-glow') {
    return themes['golden-glow'];
  }

  if (normalizedTheme === 'midnight-spark') {
    return themes['midnight-spark'];
  }

  return themes[deriveThemeFromOccasion(occasion)];
};

export const getDisplayTitle = (
  title: string | null | undefined,
  themeValue: string | null | undefined,
  occasion: string | null | undefined,
  recipientName: string | null | undefined,
) => {
  const theme = getBoardTheme(themeValue, occasion);
  const cleanTitle = title?.trim();
  const cleanRecipient = recipientName?.trim() || 'your person';
  const defaultTitle =
    occasion?.trim().toLowerCase() === 'farewell'
      ? `Wishing ${cleanRecipient} the very best`
      : `Happy ${occasion || theme.name} ${cleanRecipient}!`;

  return `${theme.emoji} ${cleanTitle || defaultTitle}`;
};
