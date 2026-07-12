import { coreTheme } from './core.theme';

// =======================================================
// Lethe Theme
// Palette: Rose Mist
// =======================================================

export const letheTheme = {
  ...coreTheme,

  product: {
    name: 'Lethe',
    palette: 'Rose Mist',
  },

  accent: {
    rgb: '215,165,185',
    primary: '#D7A5B9',
    hover: '#E4B8CA',
    dark: '#9E6D81',
    soft: 'rgba(215,165,185,0.08)',
    medium: 'rgba(215,165,185,0.18)',
    strong: 'rgba(215,165,185,0.35)',
    glow: 'rgba(215,165,185,0.22)',
    border: 'rgba(215,165,185,0.30)',
  },

  gradients: {
    hero: `
      radial-gradient(
        circle at center,
        rgba(215,165,185,.18) 0%,
        rgba(215,165,185,.08) 45%,
        transparent 100%
      )
    `,
    surface: `
      linear-gradient(
        180deg,
        rgba(255,255,255,.02) 0%,
        rgba(255,255,255,.01) 100%
      )
    `,
    card: `
      linear-gradient(
        180deg,
        rgba(255,255,255,.03),
        rgba(255,255,255,.01)
      ),
      radial-gradient(
        circle at top,
        rgba(215,165,185,.15),
        transparent 70%
      ),
      #171717
    `,
    button: `
      linear-gradient(
        135deg,
        #D7A5B9,
        #9E6D81
      )
    `,
    border: `
      linear-gradient(
        135deg,
        rgba(255,255,255,.10),
        rgba(215,165,185,.45),
        rgba(255,255,255,.05)
      )
    `,
  },

  effects: {
    glowSmall: '0 0 20px rgba(215,165,185,.12)',
    glowMedium: '0 0 35px rgba(215,165,185,.18)',
    glowLarge: '0 0 70px rgba(215,165,185,.22)',
  },
};
