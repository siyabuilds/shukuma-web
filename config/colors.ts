export const Colors = {
  primary: "#FF6B35",
  secondary: "#00B4D8",
  background: {
    light: "#F8F9FA",
    dark: "#1E1E1E",
  },
  text: {
    light: "#212529",
    dark: "#EAEAEA",
  },
  success: "#38B000",
  warning: "#F77F00",
  neutral: "#E0E0E0",
} as const;

export type ColorScheme = typeof Colors;
