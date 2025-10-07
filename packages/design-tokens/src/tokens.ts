// Primitives (same for light/dark)
export const core = {
    radius: { sm: 4, md: 8, lg: 12, xl: 16, pill: 9999 },
    space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64 },
    z: { nav: 1100, overlay: 1200, modal: 1300, toast: 1400, tooltip: 1500 },
    shadow: {
        sm: '0 1px 2px rgba(0,0,0,.06)',
        md: '0 4px 12px rgba(0,0,0,.08)',
        lg: '0 12px 24px rgba(0,0,0,.10)'
    },
    motion: {
        fast: '120ms cubic-bezier(.2,.6,.2,1)',
        base: '180ms cubic-bezier(.2,.6,.2,1)',
        slow: '260ms cubic-bezier(.2,.6,.2,1)'
    },
    outline: { width: 2, offset: 2 },
    // Data-viz starter (cat-10)
    chart10: ['#3058D5', '#D57A30', '#2AB38E', '#B03ACC', '#E04848', '#28A0E0', '#F0C04A', '#6B7C93', '#5BBA50', '#E87FB2']
};

// Palettes
export const lightPalette = {
    // brand
    navy: { 50: '#EDF2F7', 100: '#D6E0EA', 200: '#B8C7D7', 300: '#8AA3BB', 400: '#5D7FA1', 500: '#2F5A86', 600: '#24476A', 700: '#1B3753', 800: '#14283D', 900: '#0E1C2B' },
    forest: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 400: '#34D399', 500: '#059669', 600: '#047857', 700: '#065F46', 800: '#064E3B', 900: '#022C22' },
    // neutrals
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827' },
    // status
    green: { 50: '#EAFaf4', 400: '#34D399', 600: '#24936B', 700: '#175E44' },
    red: { 50: '#FEF0F0', 400: '#F87171', 600: '#DC2626', 700: '#811313' },
    blue: { 50: '#EFF6FE', 400: '#60A5FA', 600: '#2563EB', 700: '#112E81' },
    yellow: { 50: '#FEF8E9', 400: '#FBBF24', 600: '#D97706', 700: '#B45309' },
    white: '#FFFFFF', black: '#0B0D10'
};

export const darkPalette = {
    // invert w/ tuned contrast
    navy: { 50: '#0B1520', 100: '#0E1C2B', 200: '#14283D', 300: '#1B3753', 400: '#24476A', 500: '#2F5A86', 600: '#5D7FA1', 700: '#8AA3BB', 800: '#B8C7D7', 900: '#D6E0EA' },
    forest: { 50: '#022C22', 100: '#064E3B', 200: '#065F46', 300: '#047857', 400: '#059669', 500: '#34D399', 600: '#6EE7B7', 700: '#A7F3D0', 800: '#D1FAE5', 900: '#ECFDF5' },
    gray: { 50: '#0D1117', 100: '#111827', 200: '#1F2937', 300: '#2B3647', 400: '#374151', 500: '#4B5563', 600: '#6B7280', 700: '#9CA3AF', 800: '#D1D5DB', 900: '#E5E7EB' },
    green: { 50: '#0A2E20', 400: '#34D399', 600: '#24936B', 700: '#175E44' },
    red: { 50: '#2A0F10', 400: '#F87171', 600: '#DC2626', 700: '#811313' },
    blue: { 50: '#0A172E', 400: '#60A5FA', 600: '#2563EB', 700: '#112E81' },
    yellow: { 50: '#2B2105', 400: '#FBBF24', 600: '#D97706', 700: '#B45309' },
    white: '#0D1117', black: '#F9FAFB'
};

// Semantic tokens (computed per mode)
export const makeSemantic = (mode: 'light' | 'dark') => {
    const p = mode === 'light' ? lightPalette : darkPalette;
    return {
        color: {
            primary: { main: p.navy[700], light: p.navy[500], dark: p.navy[800] },
            secondary: { main: p.forest[600], light: p.forest[500], dark: p.forest[700] },
            text: { primary: p.gray[900], secondary: p.gray[600], disabled: p.gray[400] },
            background: { default: p.gray[50], paper: p.white },
            divider: p.gray[200]
        },
        surface: { primary: p.white, secondary: p.gray[50], tertiary: p.gray[100] },
        border: { subtle: p.gray[200], strong: p.gray[300], focus: p.blue[600] },
        action: { primary: p.navy[700], hover: p.navy[600], ghostHover: p.gray[100], danger: p.red[600] },
        status: {
            forReview: p.blue[600],
            inProgress: p.forest[500],
            completed: p.green[600],
            error: p.red[600],
            info: p.blue[600],
            warning: p.yellow[600],
            success: p.green[600]
        },
        typography: {
            fontFamily: `'Work Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`,
            scale: { xs: 10, sm: 14, md: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 40, '4xl': 48 },
            weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
            lineHeight: { tight: 1.2, normal: 1.45, relaxed: 1.6 }
        }
    };
};

// Export default design tokens for light mode
export const designTokens = makeSemantic('light');