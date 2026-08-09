import { describe, it, expect, beforeEach } from 'vitest';
import { safeLoadLocalStorage, safeSetLocalStorage } from '../storage';

describe('Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return fallback if key does not exist', () => {
    const result = safeLoadLocalStorage('non_existent_key', ['default']);
    expect(result).toEqual(['default']);
  });

  it('should parse valid JSON data from LocalStorage', () => {
    safeSetLocalStorage('test_key', ['item1', 'item2']);
    const result = safeLoadLocalStorage<string[]>('test_key', []);
    expect(result).toEqual(['item1', 'item2']);
  });

  it('should recover gracefully and return fallback if JSON is corrupted', () => {
    localStorage.setItem('corrupted_key', '{{{invalid-json');
    const result = safeLoadLocalStorage('corrupted_key', { defaultVal: true });
    expect(result).toEqual({ defaultVal: true });
  });

  it('should enforce runtime validator checks', () => {
    safeSetLocalStorage('object_key', { notAnArray: true });
    const result = safeLoadLocalStorage<string[]>('object_key', ['fallback'], Array.isArray);
    expect(result).toEqual(['fallback']);
  });
});
