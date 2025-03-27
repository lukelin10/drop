import { useState } from 'react';
import { useLocation } from 'wouter';

type ScreenType = 'home' | 'journal' | 'feed';

export function useScreen() {
  const [, setLocation] = useLocation();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('home');

  const navigate = (screen: ScreenType) => {
    setActiveScreen(screen);
    let path = '/';
    
    if (screen === 'journal') {
      path = '/journal';
    } else if (screen === 'feed') {
      path = '/feed';
    }
    
    setLocation(path);
  };

  return {
    activeScreen,
    navigate
  };
}
