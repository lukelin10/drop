export type ThemeName = 'cozy' | 'midnight' | 'sunset';

export const themes = {
  cozy: {
    primary: '#C06B45',    // Warm Terracotta - more contrast for better visibility
    secondary: '#5D7052',  // Sage Green - more subdued for better harmony
    accent: '#F9F4EC',     // Soft Cream - lighter for better contrast
    neutral: '#F9F4EC',    // Light Cream - lighter neutral for better readability
    surface: '#FFFFFF',    // Pure White - maximum readability for content
    text: '#2A2520'        // Dark Brown - improved contrast while maintaining warmth
  },
  midnight: {
    primary: '#8A9FD1',   // Periwinkle Blue - vibrant against dark backgrounds
    secondary: '#A06989', // Muted Mauve - elegant accent color
    accent: '#D9C5D0',    // Pale Lilac - subtle highlight color
    neutral: '#1A1B26',   // Dark Navy - rich background
    surface: '#282A3A',   // Steel Blue Gray - better reading contrast
    text: '#E8E8E8'       // Bright White - maximum readability on dark backgrounds
  },
  sunset: {
    primary: '#E67E22',    // Vibrant Orange - warm and energetic with better contrast
    secondary: '#D35400',  // Burnt Orange - deeper complementary color
    accent: '#FEF5E7',     // Lighter Cream - softer highlight with better contrast
    neutral: '#FFF9F0',    // Soft Ivory - light neutral background
    surface: '#FFFFFF',    // Pure White - maximum readability for content
    text: '#34495E'        // Deep Blue Gray - better contrast while remaining warm
  }
};
