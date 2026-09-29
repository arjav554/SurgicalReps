/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // The app is dark-only; 'class' lets RN set the scheme without NativeWind throwing on web.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Clinical editorial palette: two anchors (ink-black and warm bone, the tone of the
      // atlas plates) and one accent (arterial red). Legacy token names are kept so
      // meaning maps cleanly: `signal` and `alarm` are the accent; `vital` and `caution`
      // are bone, with status carried by typography and markers rather than hue.
      colors: {
        canvas: '#0B0D0F',
        paper: {
          DEFAULT: '#F1EBDD',
          ink: '#231E18',
          muted: '#6E6456',
        },
        surface: {
          DEFAULT: '#111417',
          raised: '#161A1E',
          pressed: '#1C2126',
        },
        line: {
          DEFAULT: '#252A30',
          strong: '#3A4148',
        },
        ink: {
          DEFAULT: '#ECE6DA',
          muted: '#A39C8F',
          faint: '#6B665D',
        },
        signal: {
          DEFAULT: '#D9483B',
          dim: '#2A1413',
        },
        alarm: {
          DEFAULT: '#D9483B',
          dim: '#2A1413',
          veil: '#120B0B',
        },
        vital: {
          DEFAULT: '#ECE6DA',
          dim: '#1A1C1E',
        },
        caution: {
          DEFAULT: '#ECE6DA',
          dim: '#16191C',
        },
      },
      // Editorial type: Libre Caslon for display and stems, IBM Plex Sans for the
      // interface, IBM Plex Mono for clinical data. One family per weight (Android).
      fontFamily: {
        headline: ['LibreCaslonDisplay_400Regular'],
        display: ['LibreCaslonText_400Regular'],
        'display-bold': ['LibreCaslonText_700Bold'],
        'display-italic': ['LibreCaslonText_400Regular_Italic'],
        ui: ['IBMPlexSans_400Regular'],
        'ui-medium': ['IBMPlexSans_500Medium'],
        'ui-semibold': ['IBMPlexSans_600SemiBold'],
        'ui-bold': ['IBMPlexSans_700Bold'],
        data: ['IBMPlexMono_400Regular'],
        'data-medium': ['IBMPlexMono_500Medium'],
        'data-semibold': ['IBMPlexMono_600SemiBold'],
      },
    },
    // Corners never exceed 4px anywhere in the system.
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '3px',
      md: '4px',
      lg: '4px',
      xl: '4px',
      '2xl': '4px',
      '3xl': '4px',
      full: '4px',
    },
  },
  plugins: [],
};
