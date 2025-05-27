import { describe, it, expect } from 'vitest';

import { version, help } from './index.js';

describe('@explicit-decisions/tooling', () => {
  it('exports version', () => {
    expect(version).toBe('1.0.0');
  });

  it('exports help text', () => {
    expect(help).toContain('explicit-decisions tooling');
    expect(help).toContain('Commands:');
  });
});