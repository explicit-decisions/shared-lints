/**
 * Tests for DecisionsManager
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { DecisionsManager } from "../src/decisions-manager.ts";

import { 
  createTestDecisions, 
  createInMemoryFS,
  createDependencyDecision,
  pastDate,
  futureDate
} from './factories.js';

describe('DecisionsManager', () => {
  let manager;
  let fs;
  
  beforeEach(() => {
    fs = createInMemoryFS();
    // Create a custom manager that uses our in-memory FS
    manager = new DecisionsManager('./decisions.toml');
    // Override the IO methods to use our in-memory FS
    manager._fs = fs;
  });
  
  describe('load', () => {
    it('should load decisions from file', async () => {
      const testDecisions = createTestDecisions({
        dependencies: {
          react: createDependencyDecision({ version: '^18.0.0' })
        }
      });
      
      await fs.write('./decisions.toml', testDecisions);
      await manager.load();
      
      expect(manager.decisions).toEqual(testDecisions);
      expect(manager.decisions.dependencies.react.version).toBe('^18.0.0');
    });
    
    it('should throw if file does not exist', async () => {
      await expect(manager.load()).rejects.toThrow('not found');
    });
  });
  
  describe('addDecision', () => {
    beforeEach(async () => {
      const decisions = createTestDecisions();
      await fs.write('./decisions.toml', decisions);
      await manager.load();
    });
    
    it('should add a new decision with defaults', async () => {
      const decision = {
        version: '^4.18.0',
        reason: 'Web framework'
      };
      
      const result = await manager.addDecision('dependencies', 'express', decision);
      
      expect(result).toMatchObject({
        version: '^4.18.0',
        reason: 'Web framework',
        decided: expect.any(String),
        reviewBy: expect.any(String)
      });
      
      // Check it was saved
      expect(manager.decisions.dependencies.express).toEqual(result);
    });
    
    it('should calculate review date 90 days from decided date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const decision = {
        version: '^4.18.0',
        reason: 'Web framework',
        decided: today
      };
      
      const result = await manager.addDecision('dependencies', 'express', decision);
      
      const decidedDate = new Date(result.decided);
      const reviewDate = new Date(result.reviewBy);
      const daysDiff = Math.round((reviewDate - decidedDate) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBe(90);
    });
    
    it('should create category if it does not exist', async () => {
      const decision = {
        choice: 'PostgreSQL',
        reason: 'ACID compliance'
      };
      
      await manager.addDecision('database', 'primary', decision);
      
      expect(manager.decisions.database).toBeDefined();
      expect(manager.decisions.database.primary.choice).toBe('PostgreSQL');
    });
  });
  
  describe('updateDecision', () => {
    beforeEach(async () => {
      const decisions = createTestDecisions({
        dependencies: {
          react: createDependencyDecision({ 
            version: '^17.0.0',
            reason: 'Old version'
          })
        }
      });
      await fs.write('./decisions.toml', decisions);
      await manager.load();
    });
    
    it('should update an existing decision', async () => {
      const updates = {
        version: '^18.0.0',
        reason: 'Upgrade to React 18'
      };
      
      const result = await manager.updateDecision('dependencies', 'react', updates);
      
      expect(result.version).toBe('^18.0.0');
      expect(result.reason).toBe('Upgrade to React 18');
      expect(result.decided).toBe(new Date().toISOString().split('T')[0]);
    });
    
    it('should throw if decision does not exist', async () => {
      await expect(
        manager.updateDecision('dependencies', 'vue', { version: '^3.0.0' })
      ).rejects.toThrow('Decision not found');
    });
  });
  
  describe('getDecisionsNeedingReview', () => {
    it('should return empty array when no decisions need review', async () => {
      const decisions = createTestDecisions({
        withCurrent: ['react', 'typescript']
      });
      
      await fs.write('./decisions.toml', decisions);
      await manager.load();
      
      const needsReview = await manager.getDecisionsNeedingReview();
      
      expect(needsReview).toEqual([]);
    });
    
    it('should return overdue decisions sorted by days overdue', async () => {
      const decisions = createTestDecisions({
        withOverdue: [
          { key: 'react', daysOverdue: 30 },
          { key: 'typescript', daysOverdue: 60 },
          { key: 'eslint', daysOverdue: 15 }
        ]
      });
      
      await fs.write('./decisions.toml', decisions);
      await manager.load();
      
      const needsReview = await manager.getDecisionsNeedingReview();
      
      expect(needsReview).toHaveLength(3);
      expect(needsReview[0].key).toBe('typescript');
      expect(needsReview[0].daysOverdue).toBe(60);
      expect(needsReview[1].key).toBe('react');
      expect(needsReview[1].daysOverdue).toBe(30);
      expect(needsReview[2].key).toBe('eslint');
      expect(needsReview[2].daysOverdue).toBe(15);
    });
    
    it('should handle nested decision structures', async () => {
      const decisions = createTestDecisions({
        dependencies: {
          production: {
            react: createDependencyDecision({ reviewBy: pastDate(10) })
          },
          dev: {
            vitest: createDependencyDecision({ reviewBy: futureDate(30) })
          }
        }
      });
      
      await fs.write('./decisions.toml', decisions);
      await manager.load();
      
      const needsReview = await manager.getDecisionsNeedingReview();
      
      expect(needsReview).toHaveLength(1);
      expect(needsReview[0].key).toBe('react');
    });
  });
  
  describe('getDecisionsByTag', () => {
    beforeEach(async () => {
      const decisions = createTestDecisions({
        dependencies: {
          react: createDependencyDecision({ tags: ['frontend', 'ui'] }),
          express: createDependencyDecision({ tags: ['backend', 'api'] }),
          typescript: createDependencyDecision({ tags: ['frontend', 'backend', 'types'] })
        }
      });
      await fs.write('./decisions.toml', decisions);
      await manager.load();
    });
    
    it('should return decisions with specific tag', async () => {
      const frontend = await manager.getDecisionsByTag('frontend');
      
      expect(frontend).toHaveLength(2);
      expect(frontend.map(d => d.key)).toContain('react');
      expect(frontend.map(d => d.key)).toContain('typescript');
    });
    
    it('should return empty array for non-existent tag', async () => {
      const mobile = await manager.getDecisionsByTag('mobile');
      
      expect(mobile).toEqual([]);
    });
  });
  
  describe('searchDecisions', () => {
    beforeEach(async () => {
      const decisions = createTestDecisions({
        dependencies: {
          'eslint': createDependencyDecision({ 
            reason: 'Code quality and consistency' 
          }),
          'eslint-plugin-react': createDependencyDecision({ 
            reason: 'React specific linting rules' 
          }),
          'typescript': createDependencyDecision({ 
            reason: 'Type safety',
            tags: ['types', 'development']
          })
        }
      });
      await fs.write('./decisions.toml', decisions);
      await manager.load();
    });
    
    it('should find decisions by key', async () => {
      const results = await manager.searchDecisions('eslint');
      
      expect(results).toHaveLength(2);
      expect(results.map(r => r.key)).toContain('eslint');
      expect(results.map(r => r.key)).toContain('eslint-plugin-react');
    });
    
    it('should find decisions by reason text', async () => {
      const results = await manager.searchDecisions('quality');
      
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('eslint');
    });
    
    it('should find decisions by tag', async () => {
      const results = await manager.searchDecisions('types');
      
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('typescript');
    });
    
    it('should be case insensitive', async () => {
      const results = await manager.searchDecisions('ESLINT');
      
      expect(results).toHaveLength(2);
    });
  });
  
  describe('getReviewStatus', () => {
    it('should provide comprehensive review summary', async () => {
      const decisions = createTestDecisions({
        dependencies: {
          // Overdue
          react: createDependencyDecision({ reviewBy: pastDate(30) }),
          typescript: createDependencyDecision({ reviewBy: pastDate(10) }),
          // Upcoming (within 30 days)
          eslint: createDependencyDecision({ reviewBy: futureDate(15) }),
          // Current (beyond 30 days)
          vitest: createDependencyDecision({ reviewBy: futureDate(60) })
        }
      });
      
      await fs.write('./decisions.toml', decisions);
      await manager.load();
      
      const status = await manager.getReviewStatus();
      
      expect(status.total).toBe(4);
      expect(status.needsReview).toBe(3); // 2 overdue + 1 upcoming
      expect(status.overdue).toBe(2);
      expect(status.overdueDecisions).toHaveLength(2);
      expect(status.upcomingReviews).toHaveLength(1);
      
      // Check sorting
      expect(status.overdueDecisions[0].key).toBe('react'); // More overdue
      expect(status.overdueDecisions[0].daysOverdue).toBe(30);
      expect(status.upcomingReviews[0].key).toBe('eslint');
      expect(status.upcomingReviews[0].daysUntilReview).toBe(15);
    });
  });
});