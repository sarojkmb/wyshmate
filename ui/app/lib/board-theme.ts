import type { CSSProperties } from 'react';

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export type BoardTheme = {
  key: 'wyshmate-classic';
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

const wyshmateTheme: BoardTheme = {
  key: 'wyshmate-classic',
  name: 'Wyshmate Classic',
  emoji: '✨',
  heroLabel: 'Wishbook board',
  description: 'Warm, polished, and designed to feel special on every screen.',
  heroGradient:
    'linear-gradient(135deg, rgba(45, 127, 163, 0.97), rgba(112, 183, 207, 0.95) 54%, rgba(245, 200, 103, 0.94))',
  heroShadow: '0 28px 70px rgba(45, 127, 163, 0.18)',
  accent: '#2d7fa3',
  accentSoft: 'rgba(45, 127, 163, 0.14)',
  accentStrong: '#b9851b',
  shellStyle: {
    '--theme-card-top': 'rgba(255, 255, 255, 0.92)',
    '--theme-card-bottom': 'rgba(249, 253, 255, 0.97)',
    '--theme-card-border': 'rgba(45, 127, 163, 0.15)',
    '--theme-card-shadow': '0 28px 65px rgba(45, 127, 163, 0.08)',
    '--theme-orb-a': 'rgba(116, 193, 223, 0.14)',
    '--theme-orb-b': 'rgba(245, 200, 103, 0.12)',
    '--theme-radial-a': 'rgba(116, 193, 223, 0.22)',
    '--theme-radial-b': 'rgba(245, 200, 103, 0.16)',
    '--theme-top': '#fdfefe',
    '--theme-mid': '#edf6fa',
    '--theme-bottom': '#e7f3f8',
  },
};

export const deriveThemeFromOccasion = (_occasion?: string | null) => wyshmateTheme.key;

export const getBoardTheme = (_theme?: string | null, _occasion?: string | null) => wyshmateTheme;

const getOccasionEmoji = (occasion?: string | null) => {
  const normalized = occasion?.trim().toLowerCase();

  if (normalized === 'birthday') {
    return '🎉';
  }

  if (normalized === 'farewell') {
    return '💼';
  }

  if (normalized === 'anniversary') {
    return '💖';
  }

  if (normalized === 'graduation') {
    return '🎓';
  }

  if (normalized === 'wedding') {
    return '💍';
  }

  return '✨';
};

export const getDisplayTitle = (
  title: string | null | undefined,
  _themeValue: string | null | undefined,
  occasion: string | null | undefined,
  recipientName: string | null | undefined,
) => {
  const cleanTitle = title?.trim();
  const cleanRecipient = recipientName?.trim() || 'your person';
  const defaultTitle =
    occasion?.trim().toLowerCase() === 'farewell'
      ? `Wishing ${cleanRecipient} the very best`
      : `Happy ${occasion || 'Celebration'} ${cleanRecipient}!`;

  return `${getOccasionEmoji(occasion)} ${cleanTitle || defaultTitle}`;
};
