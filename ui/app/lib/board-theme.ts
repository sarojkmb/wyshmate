import type { CSSProperties } from 'react';

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export type BoardTheme = {
  key: 'birthday' | 'farewell' | 'celebration';
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
  birthday: {
    key: 'birthday',
    name: 'Birthday',
    emoji: '🎉',
    heroLabel: 'Birthday board',
    description: 'Colorful, bright, and a little confetti-coded.',
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
  farewell: {
    key: 'farewell',
    name: 'Farewell',
    emoji: '💼',
    heroLabel: 'Farewell board',
    description: 'Soft, calm, and warm without feeling too heavy.',
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
  celebration: {
    key: 'celebration',
    name: 'Celebration',
    emoji: '✨',
    heroLabel: 'Celebration board',
    description: 'Neutral, polished, and ready for almost any moment.',
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
};

export const getBoardTheme = (occasion?: string | null): BoardTheme => {
  const normalized = occasion?.trim().toLowerCase();

  if (normalized === 'birthday') {
    return themes.birthday;
  }

  if (normalized === 'farewell') {
    return themes.farewell;
  }

  return themes.celebration;
};

export const getDisplayTitle = (
  title: string | null | undefined,
  occasion: string | null | undefined,
  recipientName: string | null | undefined,
) => {
  const theme = getBoardTheme(occasion);
  const cleanTitle = title?.trim();
  const cleanRecipient = recipientName?.trim() || 'your person';
  const defaultTitle =
    theme.key === 'farewell'
      ? `Wishing ${cleanRecipient} the very best`
      : `Happy ${occasion || theme.name} ${cleanRecipient}!`;

  return `${theme.emoji} ${cleanTitle || defaultTitle}`;
};
