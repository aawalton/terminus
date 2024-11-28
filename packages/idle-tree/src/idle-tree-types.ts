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

// V4 adds rootSaturation and changes version
export type TreeGameStateV4 = Omit<TreeGameStateV3, 'stateVersion'> & {
  rootSaturation: {
    [zoneId: string]: string;
  };
  stateVersion: 4;
};

// V5 removes essenceRecoveryPerMinute and changes version
export type TreeGameStateV5 = Omit<TreeGameStateV4, 'essenceRecoveryPerMinute' | 'stateVersion'> & {
  stateVersion: 5;
};

// V6 adds rootEssenceAllocation and changes version
export type TreeGameStateV6 = Omit<TreeGameStateV5, 'stateVersion'> & {
  rootEssenceAllocation: {
    [zoneId: string]: string;
  };
  stateVersion: 6;
};

export type TreeGameState = TreeGameStateV1 | TreeGameStateV2 | TreeGameStateV3 | TreeGameStateV4 | TreeGameStateV5 | TreeGameStateV6;
export type CurrentTreeGameState = TreeGameStateV6;

// Calculated state interface
export interface TreeGameStateCalculated extends CurrentTreeGameState {
  ageInDays: number;
  cultivationStage: string;
  maxEssence: string;
  essenceRecoveryPerMinute: string;
  totalAllocation: string;
  netGeneration: string;
}

export interface CultivationStage {
  tier: string;
  name: string;
  essence: bigint;
}