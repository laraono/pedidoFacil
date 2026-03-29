/**
 * Design tokens — espelha a paleta do web (tailwind.config.js + Menu.vue defaults)
 *
 * Web defaults (Menu.vue):
 *   bgColor        : #F5F6FA   (page background)
 *   cardBg         : #FFFFFF   (surface / cards)
 *   buttonColor    : #1E7BC4   (primary action — azul)
 *   buttonTextColor: #FFFFFF
 *   categoryColor  : #7AB648   (accent — verde)
 *   textColor      : #212121
 */

// Primary (azul)
const primary        = '#1E7BC4';
const primaryDark    = '#155D96';
const primaryLight   = '#E3F0FA';

// Accent (verde)
const accent         = '#7AB648';
const accentDark     = '#5A9030';
const accentLight    = '#EBF5E0';

// Teal
const teal           = '#26C6DA';
const tealDark       = '#1BAEC2';

// Danger
const danger         = '#E53935';
const dangerLight    = '#FFEBEE';

export const Colors = {
  light: {
    text:             '#212121',
    textMuted:        '#757575',
    background:       '#F5F6FA',
    surface:          '#FFFFFF',
    border:           '#E0E0E0',
    tint:             primary,
    tintPressed:      primaryDark,
    tintLight:        primaryLight,
    highlight:        accent,
    highlightPressed: accentDark,
    highlightLight:   accentLight,
    teal,
    tealDark,
    danger,
    dangerLight,
    tabIconDefault:   '#757575',
    tabIconSelected:  primary,
  },
  dark: {
    text:             '#F0F4F8',
    textMuted:        'rgba(240,244,248,0.55)',
    background:       '#0B0E11',
    surface:          '#1A1E24',
    border:           'rgba(255,255,255,0.1)',
    tint:             primary,
    tintPressed:      primaryDark,
    tintLight:        'rgba(30,123,196,0.15)',
    highlight:        accent,
    highlightPressed: accentDark,
    highlightLight:   'rgba(122,182,72,0.15)',
    teal,
    tealDark,
    danger,
    dangerLight:      'rgba(229,57,53,0.15)',
    tabIconDefault:   'rgba(240,244,248,0.4)',
    tabIconSelected:  primary,
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorToken  = keyof typeof Colors.light;

export default Colors;
