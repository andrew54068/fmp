import { createContext, Dispatch, SetStateAction } from 'react';

interface FooterContext {
  setFooterPosition: Dispatch<SetStateAction<{ bottom: number; left: number }>>;
}

export const FooterContext = createContext<FooterContext>({
  setFooterPosition: () => { }
});