import { createTheme, ThemeOptions } from '@mui/material/styles';
import { makeSemantic, core } from '@rialto/design-tokens';

export const createRialtoTheme = (mode: 'light' | 'dark' = 'light') => {
  const designTokens = makeSemantic(mode);
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: designTokens.color.primary.main,
        light: designTokens.color.primary.light,
        dark: designTokens.color.primary.dark,
      },
      secondary: {
        main: designTokens.color.secondary.main,
        light: designTokens.color.secondary.light,
        dark: designTokens.color.secondary.dark,
      },
      success: {
        main: designTokens.status.success,
      },
      warning: {
        main: designTokens.status.warning,
      },
      error: {
        main: designTokens.status.error,
      },
      info: {
        main: designTokens.status.info,
      },
      background: {
        default: designTokens.color.background.default,
        paper: designTokens.color.background.paper,
      },
      text: {
        primary: designTokens.color.text.primary,
        secondary: designTokens.color.text.secondary,
        disabled: designTokens.color.text.disabled,
      },
      divider: designTokens.color.divider,
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily,
      h1: {
        fontSize: `${designTokens.typography.scale['4xl']}px`, // 48px (new larger size)
        fontWeight: designTokens.typography.weight.bold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h2: {
        fontSize: `${designTokens.typography.scale['3xl']}px`, // 40px (was h1)
        fontWeight: designTokens.typography.weight.bold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h3: {
        fontSize: `${designTokens.typography.scale['2xl']}px`, // 32px (was h2)
        fontWeight: designTokens.typography.weight.semibold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h4: {
        fontSize: `${designTokens.typography.scale.xl}px`, // 24px (was h3)
        fontWeight: designTokens.typography.weight.semibold,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      h5: {
        fontSize: `${designTokens.typography.scale.lg}px`, // 20px (was h4)
        fontWeight: designTokens.typography.weight.semibold,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      h6: {
        fontSize: `${designTokens.typography.scale.lg}px`, // 20px (same as h5 but different weight)
        fontWeight: designTokens.typography.weight.medium,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      body1: {
        fontSize: `${designTokens.typography.scale.md}px`, // 16px
        fontWeight: designTokens.typography.weight.regular,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      body2: {
        fontSize: `${designTokens.typography.scale.sm}px`, // 14px
        fontWeight: designTokens.typography.weight.regular,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      caption: {
        fontSize: `${designTokens.typography.scale.xs}px`, // 12px
        fontWeight: designTokens.typography.weight.regular,
        lineHeight: designTokens.typography.lineHeight.relaxed,
      },
    },
    spacing: core.space[1], // 4px base unit
    shape: {
      borderRadius: core.radius.md, // 8px
    },
    shadows: [
      'none',
      core.shadow.sm,
      core.shadow.md,
      core.shadow.lg,
      core.shadow.lg,
      ...Array(20).fill(core.shadow.lg), // Fill remaining shadow levels
    ] as any,
  };

  return createTheme(themeOptions);
};