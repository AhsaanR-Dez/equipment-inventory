import { beforeEach, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { uniqueHostname } from './hostnames.ts';

describe('uniqueHostname', () => {
  beforeEach(() => {
    // Fixed seed, so a failure is reproducible instead of showing up once every
    // few runs.
    faker.seed(1234);
  });

  it('gives back a different name every time', () => {
    const taken = new Set<string>();
    const names: string[] = [];

    for (let i = 0; i < 100; i += 1) {
      names.push(uniqueHostname(taken));
    }

    expect(new Set(names).size).toBe(100);
  });

  it('adds the name it picked to the set', () => {
    const taken = new Set<string>();
    const name = uniqueHostname(taken);
    expect(taken.has(name)).toBe(true);
    expect(taken.size).toBe(1);
  });

  it('never returns a name that was already taken', () => {
    const taken = new Set<string>();
    const first = uniqueHostname(taken);

    for (let i = 0; i < 50; i += 1) {
      expect(uniqueHostname(taken)).not.toBe(first);
    }
  });

  it('only uses characters that are legal in a hostname', () => {
    const taken = new Set<string>();

    for (let i = 0; i < 100; i += 1) {
      // Letters, numbers and hyphens only. No spaces, dots or punctuation.
      expect(uniqueHostname(taken)).toMatch(/^[A-Z0-9-]+$/);
    }
  });

  it('does not start or end with a hyphen', () => {
    const taken = new Set<string>();

    for (let i = 0; i < 100; i += 1) {
      const name = uniqueHostname(taken);
      expect(name.startsWith('-')).toBe(false);
      expect(name.endsWith('-')).toBe(false);
    }
  });

  it('stays under the 15 character NetBIOS limit', () => {
    const taken = new Set<string>();

    for (let i = 0; i < 200; i += 1) {
      expect(uniqueHostname(taken).length).toBeLessThanOrEqual(15);
    }
  });
});
