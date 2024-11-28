import midgardWorld from '../config/worlds/midgard.json';

export interface Zone {
  name: string;
  id: string;
  size: number;
  density: number;
  difficulty: number;
}

export interface Region {
  name: string;
  id: string;
  dangerLevel: number;
  zones: Zone[];
}

export interface World {
  universeName: string;
  worldName: string;
  id: string;
  regions: Region[];
}

// Add all world config files here
export const worlds: World[] = [
  midgardWorld
]; 