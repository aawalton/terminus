// Re-export types
export type {
  TreeGameState,
  CurrentTreeGameState,
  TreeGameStateCalculated,
} from './idle-tree-types';

// Re-export game logic
export {
  DEFAULT_GAME_STATE,
  migrateGameState,
  getCultivationStage,
  calculateAgeInDays,
  calculateMaxEssence,
} from './idle-tree-game-logic'; 