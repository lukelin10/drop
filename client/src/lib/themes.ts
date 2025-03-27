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
    surface: '#35374A',   // Slate Blue - more readable than the original
    text: '#D1D1D1'       // Silver Gray - elegant and easy to read
  },
  sunset: {
    primary: '#F9A826',    // Golden Yellow - warm and energetic
    secondary: '#E05780',  // Rose Pink - vibrant and joyful
    accent: '#FBE5D6',     // Peach Cream - soft and delicate
    neutral: '#20283D',    // Deep Blue - elegant evening sky
    surface: '#FBE5D6',    // Peach Cream for better readability
    text: '#20283D'        // Deep Blue - clear and crisp contrast
  }
};
