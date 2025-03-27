export type ThemeName = 'cozy' | 'midnight' | 'sunset';

export const themes = {
  cozy: {
    primary: '#D27D52',   // Soft Terracotta - warm and inviting
    secondary: '#556B2F', // Deep Olive - grounded and earthy
    accent: '#F5EFE6',    // Warm Cream - soothing and comfortable
    neutral: '#3B2E2A',   // Rich Chestnut - evokes the feeling of a rustic cabin
    surface: '#F5EFE6',   // Using Warm Cream for better readability
    text: '#2D2D2D'       // Charcoal Black - strong but subtle contrast
  },
  midnight: {
    primary: '#1B2432',   // Deep Midnight Blue - mysterious and intimate
    secondary: '#543C52', // Burgundy Wine - rich and comforting
    accent: '#C9A3B4',    // Dusty Rose - subtle touch of warmth
    neutral: '#2E2E3A',   // Smoky Quartz - cozy and grounding
    surface: '#C9A3B4',   // Using Dusty Rose for better readability
    text: '#D1D1D1'       // Silver Gray - elegant and easy to read
  },
  sunset: {
    primary: '#FF7043',
    secondary: '#FFAB91',
    accent: '#E64A19',
    neutral: '#FFF8F6',
    surface: '#FFFFFF',
    text: '#BF360C'
  }
};
