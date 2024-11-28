// Base game state interfaces
export interface TreeGameStateV1 {
  treeName: string | null;
  currentLevel: number;
  maxEssence: string;
  currentEssence: string;
  essenceRecoveryPerMinute: string;
  essenceGainedAt: string; // timestamp
  dailyCredits: number;
  dailyCreditsGainedAt: string; // timestamp
  stateVersion: 1;
}

// V2 adds createdAt and changes version
export type TreeGameStateV2 = Omit<TreeGameStateV1, 'stateVersion'> & {
  createdAt: string;
  stateVersion: 2;
};

// V3 removes maxEssence and changes version
export type TreeGameStateV3 = Omit<TreeGameStateV2, 'maxEssence' | 'stateVersion'> & {
  stateVersion: 3;
};

export type TreeGameState = TreeGameStateV1 | TreeGameStateV2 | TreeGameStateV3;
export type CurrentTreeGameState = TreeGameStateV3;

// Calculated state interface
export interface TreeGameStateCalculated extends CurrentTreeGameState {
  ageInDays: number;
  cultivationStage: string;
  maxEssence: string;
} 