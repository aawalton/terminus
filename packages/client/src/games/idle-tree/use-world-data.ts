import { useState, useEffect } from 'react';
import { worlds, World } from '@terminus/idle-tree';

export function useWorldData() {
  const [worldData, setWorldData] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just use the first world (Midgard)
    setWorldData(worlds[0]);
    setLoading(false);
  }, []);

  return { worldData, loading };
} 