/**
 * Test factories for creating consistent test data
 */

/**
 * Create a valid test decisions object
 */
export function createTestDecisions(options = {}) {
  const base = {
    metadata: {
      version: '1.0',
      description: options.description || 'Test decisions',
      created: options.created || '2024-01-01',
      schema: './decisions.schema.json'
    }
  };
  
  // Add dependencies
  if (options.dependencies) {
    base.dependencies = options.dependencies;
  }
  
  // Add decisions that are overdue for review
  if (options.withOverdue) {
    base.dependencies = base.dependencies || {};
    
    for (const item of options.withOverdue) {
      const config = typeof item === 'string' 
        ? { key: item, daysOverdue: 30 } 
        : item;
      
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - config.daysOverdue);
      
      base.dependencies[config.key] = {
        version: config.version || '^1.0.0',
        reason: config.reason || `Test ${config.key}`,
        decided: '2024-01-01',
        reviewBy: reviewDate.toISOString().split('T')[0],
        tags: config.tags || ['test']
      };
    }
  }
  
  // Add current (not overdue) decisions
  if (options.withCurrent) {
    base.dependencies = base.dependencies || {};
    
    for (const key of options.withCurrent) {
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + 90);
      
      base.dependencies[key] = {
        version: '^2.0.0',
        reason: `Current ${key}`,
        decided: new Date().toISOString().split('T')[0],
        reviewBy: reviewDate.toISOString().split('T')[0],
        tags: ['test', 'current']
      };
    }
  }
  
  // Add architecture decisions
  if (options.architecture) {
    base.architecture = options.architecture;
  }
  
  return base;
}

/**
 * Create an in-memory file system for testing
 */
export function createInMemoryFS() {
  const files = new Map();
  
  return {
    async read(path) {
      if (!files.has(path)) {
        const error = new Error(`ENOENT: no such file or directory, open '${path}'`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(path);
    },
    
    async write(path, content) {
      files.set(path, typeof content === 'string' ? content : JSON.stringify(content));
    },
    
    async exists(path) {
      return files.has(path);
    },
    
    async mkdir(path, options) {
      // No-op for in-memory FS
      return true;
    },
    
    clear() {
      files.clear();
    },
    
    // For debugging
    listFiles() {
      return Array.from(files.keys());
    }
  };
}

/**
 * Create a test decision
 */
export function createDecision(overrides = {}) {
  return {
    value: overrides.value || 'test-value',
    reason: overrides.reason || 'Test reason',
    decided: overrides.decided || new Date().toISOString().split('T')[0],
    reviewBy: overrides.reviewBy || calculateReviewDate(),
    tags: overrides.tags || ['test'],
    ...overrides
  };
}

/**
 * Create a dependency decision
 */
export function createDependencyDecision(overrides = {}) {
  return {
    version: overrides.version || '^1.0.0',
    reason: overrides.reason || 'Test dependency',
    decided: overrides.decided || new Date().toISOString().split('T')[0],
    reviewBy: overrides.reviewBy || calculateReviewDate(),
    tags: overrides.tags || ['dependency', 'test'],
    ...overrides
  };
}

/**
 * Calculate a review date
 */
export function calculateReviewDate(days = 90, fromDate = new Date()) {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Create a date in the past
 */
export function pastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

/**
 * Create a date in the future
 */
export function futureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}