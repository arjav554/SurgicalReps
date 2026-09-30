/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // The app is dark-only; 'class' lets RN set the scheme without NativeWind throwing on web.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Marble and gold on blue-black: two anchors (near-black navy and warm bone, the tone of
      // the atlas plates), gold for emphasis and red kept for danger. Legacy token names are kept:
      // `signal` is gold, `alarm` is red, `vital` and `caution` are bone, with status carried by
      // typography and markers rather than hue.
      colors: {
        canvas: '#080B10',
        paper: {
          DEFAULT: '#F1EBDD',
          ink: '#231E18',
          muted: '#6E6456',
        },
        surface: {
          DEFAULT: '#0D1218',
          raised: '#121820',
          pressed: '#18202A',
        },
        line: {
          DEFAULT: '#1E2530',
          strong: '#2E3742',
        },
        // Input and control boundaries: 3:1 on every surface.
        field: '#6A7078',
        ink: {
          DEFAULT: '#ECE6DA',
          muted: '#A8A295',
          faint: '#8B8780',
        },
        gold: {
          DEFAULT: '#C9A45C',
          dim: '#1C1810',
        },
        signal: {
          DEFAULT: '#C9A45C',
          dim: '#1C1810',
        },
        alarm: {
          DEFAULT: '#E06356',
          dim: '#2A1413',
          veil: '#120B0B',
        },
        vital: {
          DEFAULT: '#ECE6DA',
          dim: '#14181C',
        },
        caution: {
          DEFAULT: '#ECE6DA',
          dim: '#12161B',
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
