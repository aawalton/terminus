import { createContext, useContext, ReactNode } from 'react';
import { TreeGameStateCalculated } from '@terminus/idle-tree';
import { useIdleTreeGameState } from './use-idle-tree-game-state';

interface IdleTreeContextType {
  gameState: TreeGameStateCalculated;
  loading: boolean;
  saveGame: (newState: TreeGameStateCalculated) => Promise<boolean>;
  updateAllocation: (zoneId: string, amount: string) => Promise<void>;
}

const IdleTreeContext = createContext<IdleTreeContextType | null>(null);

export function IdleTreeProvider({ children }: { children: ReactNode }) {
  const gameState = useIdleTreeGameState();

  return (
    <IdleTreeContext.Provider value={gameState}>
      {children}
    </IdleTreeContext.Provider>
  );
}

export function useIdleTree() {
  const context = useContext(IdleTreeContext);
  if (!context) {
    throw new Error('useIdleTree must be used within an IdleTreeProvider');
  }
  return context;
} 