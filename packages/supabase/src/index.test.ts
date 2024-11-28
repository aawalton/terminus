import supabase from './index';
import { jest } from '@jest/globals';

describe('Supabase Client', () => {
  test('should create a Supabase client with correct configuration', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth.getUser).toBe('function');
  });

  test('should be able to connect to Supabase', async () => {
    // Simple health check using auth.getSession()
    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
}); 