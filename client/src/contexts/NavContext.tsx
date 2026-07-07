import React, { createContext, useContext, useState } from 'react';

export type Screen =
  | 'cover'
  | 'building'
  | 'dashboard'
  | 'act1'
  | 'act2'
  | 'flow'
  | 'ladder'
  | 'act3';

interface NavContextValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  assistantOpen: boolean;
  setAssistantOpen: (v: boolean) => void;
}

const NavContext = createContext<NavContextValue>({
  screen: 'cover',
  setScreen: () => {},
  assistantOpen: false,
  setAssistantOpen: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('cover');
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <NavContext.Provider value={{ screen, setScreen, assistantOpen, setAssistantOpen }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
