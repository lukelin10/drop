export type ThemeName = 'cozy' | 'forest' | 'sunset';

export const themes = {
  cozy: {
    primary: '#D27D52',   // Soft Terracotta - warm and inviting
    secondary: '#556B2F', // Deep Olive - grounded and earthy
    accent: '#F5EFE6',    // Warm Cream - soothing and comfortable
    neutral: '#3B2E2A',   // Rich Chestnut - evokes the feeling of a rustic cabin
    surface: '#F5EFE6',   // Using Warm Cream for better readability
    text: '#2D2D2D'       // Charcoal Black - strong but subtle contrast
  },
  forest: {
    primary: '#43A047',
    secondary: '#81C784',
    accent: '#2E7D32',
    neutral: '#F9FBF7',
    surface: '#FFFFFF',
    text: '#1B5E20'
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
