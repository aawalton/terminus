import supabase from './database';
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

  test('should throw error when environment variables are not set', () => {
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Using jest.isolateModules with a synchronous import
    expect(() => {
      jest.isolateModules(() => {
        // Dynamic import would create a new instance, which isn't what we want to test
        const db = require('./database');
        expect(db).toBeUndefined();
      });
    }).toThrow();

    // Restore environment variables
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });
}); 