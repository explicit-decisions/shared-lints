import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { DecisionsManager, createDateString } from "./manager.ts";

describe('DecisionsManager', () => {
  const testConfigPath = 'test-decisions.toml';
  let manager: DecisionsManager;

  beforeEach(() => {
    manager = new DecisionsManager(testConfigPath);
  });

  afterEach(async () => {
    if (existsSync(testConfigPath)) {
      await unlink(testConfigPath);
    }
  });

  describe('init', () => {
    it('creates a new decisions file with metadata', async () => {
      await manager.init();
      
      expect(existsSync(testConfigPath)).toBe(true);
      
      const decisions = await manager.load();
      expect(decisions['metadata']).toMatchObject({
        version: '1.0',
        description: 'Technical decisions for this project'
      });
      expect(decisions['defaults']).toMatchObject({
        reviewAfter: '6m'
      });
    });

    it('creates file with examples when requested', async () => {
      await manager.init(true);
      
      const decisions = await manager.load();
      expect(decisions['dependencies']).toBeDefined();
      
      const deps = decisions['dependencies'] as Record<string, unknown>;
      expect(deps['typescript']).toMatchObject({
        value: '^5.7.0',
        reason: 'Native .ts import support'
      });
    });

    it('throws error if file already exists', async () => {
      await manager.init();
      
      await expect(manager.init()).rejects.toThrow('File already exists');
    });
  });

  describe('load', () => {
    it('throws error if file does not exist', async () => {
      await expect(manager.load()).rejects.toThrow('Decisions file not found');
    });

    it('loads and parses TOML content', async () => {
      await manager.init();
      const decisions = await manager.load();
      
      expect(decisions).toHaveProperty('metadata');
      expect(decisions).toHaveProperty('defaults');
    });
  });

  describe('add', () => {
    beforeEach(async () => {
      await manager.init();
    });

    it('adds a decision to existing category', async () => {
      await manager.add('dependencies', 'typescript', '^5.8.0', 'Latest version');
      
      const decisions = await manager.list();
      const tsDecision = decisions.find(d => d.key === 'typescript');
      
      expect(tsDecision).toMatchObject({
        category: 'dependencies',
        key: 'typescript',
        value: '^5.8.0',
        reason: 'Latest version'
      });
      expect(tsDecision?.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('creates new category if it does not exist', async () => {
      await manager.add('tools', 'eslint', '^9.0.0', 'Linting framework');
      
      const decisions = await manager.list();
      const eslintDecision = decisions.find(d => d.key === 'eslint');
      
      expect(eslintDecision).toMatchObject({
        category: 'tools',
        key: 'eslint',
        value: '^9.0.0',
        reason: 'Linting framework'
      });
    });

    it('sets review date 6 months in future', async () => {
      const beforeAdd = new Date();
      await manager.add('test', 'package', '1.0.0', 'test reason');
      const afterAdd = new Date();
      
      const decisions = await manager.list();
      const decision = decisions[0];
      if (!decision) throw new Error('No decision found');
      const reviewDate = new Date(decision.reviewBy);
      
      expect(reviewDate.getTime()).toBeGreaterThan(beforeAdd.getTime() + (5.5 * 30 * 24 * 60 * 60 * 1000));
      expect(reviewDate.getTime()).toBeLessThan(afterAdd.getTime() + (6.5 * 30 * 24 * 60 * 60 * 1000));
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      await manager.init();
    });

    it('returns empty array when no decisions exist', async () => {
      const decisions = await manager.list();
      expect(decisions).toEqual([]);
    });

    it('returns all decisions with expiry status', async () => {
      await manager.add('deps', 'pkg1', '1.0.0', 'reason1');
      await manager.add('tools', 'pkg2', '2.0.0', 'reason2');
      
      const decisions = await manager.list();
      
      expect(decisions).toHaveLength(2);
      expect(decisions[0]).toMatchObject({
        category: 'deps',
        key: 'pkg1',
        expired: false
      });
      expect(decisions[1]).toMatchObject({
        category: 'tools', 
        key: 'pkg2',
        expired: false
      });
    });

    it('ignores metadata and defaults sections', async () => {
      await manager.add('test', 'package', '1.0.0', 'test');
      
      const decisions = await manager.list();
      
      expect(decisions.every(d => d.category !== 'metadata')).toBe(true);
      expect(decisions.every(d => d.category !== 'defaults')).toBe(true);
    });
  });

  describe('listByCategory', () => {
    beforeEach(async () => {
      await manager.init();
      await manager.add('dependencies', 'pkg1', '1.0.0', 'reason1');
      await manager.add('tools', 'pkg2', '2.0.0', 'reason2');
      await manager.add('dependencies', 'pkg3', '3.0.0', 'reason3');
    });

    it('returns only decisions from specified category', async () => {
      const depDecisions = await manager.listByCategory('dependencies');
      
      expect(depDecisions).toHaveLength(2);
      expect(depDecisions.every(d => d.category === 'dependencies')).toBe(true);
      expect(depDecisions.map(d => d.key)).toEqual(['pkg1', 'pkg3']);
    });

    it('returns empty array for non-existent category', async () => {
      const decisions = await manager.listByCategory('nonexistent');
      expect(decisions).toEqual([]);
    });
  });

  describe('getExpired', () => {
    beforeEach(async () => {
      await manager.init();
    });

    it('returns empty array when no decisions are expired', async () => {
      await manager.add('test', 'package', '1.0.0', 'test');
      
      const expired = await manager.getExpired();
      expect(expired).toEqual([]);
    });

    it('identifies expired decisions correctly', async () => {
      // Add a decision and manually modify the TOML to have past date
      await manager.add('test', 'package', '1.0.0', 'test');
      
      const decisions = await manager.load();
      const testCat = decisions['test'] as Record<string, unknown>;
      const packageDecision = testCat['package'] as Record<string, unknown>;
      packageDecision['reviewBy'] = '2020-01-01';
      await manager.save(decisions);
      
      const expired = await manager.getExpired();
      expect(expired).toHaveLength(1);
      expect(expired[0]?.expired).toBe(true);
    });
  });
});

describe('createDateString', () => {
  it('returns current date in YYYY-MM-DD format by default', () => {
    const dateStr = createDateString();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats provided date correctly', () => {
    const testDate = new Date('2024-03-15T10:30:00Z');
    const dateStr = createDateString(testDate);
    expect(dateStr).toBe('2024-03-15');
  });
});