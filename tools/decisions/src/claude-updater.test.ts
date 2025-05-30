import { mkdtemp, rm, readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ClaudeUpdater } from './claude-updater.ts';

describe('ClaudeUpdater', () => {
  let testDir: string;
  let updater: ClaudeUpdater;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'claude-updater-test-'));
    updater = new ClaudeUpdater(
      join(import.meta.dirname, 'test-fixtures/source-claude.md'),
      join(testDir, 'CLAUDE.md')
    );
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('parseFile', () => {
    it('should parse marked sections correctly', () => {
      const content = `# Claude Instructions

<!-- BEGIN: shared-lints/core-principles v1.0.0 -->
## Core Principle: Think Before Acting

1. Take a step back
<!-- END: shared-lints/core-principles -->

Some custom content here

<!-- BEGIN: project-specific -->
## My Project Rules

Custom rules
<!-- END: project-specific -->

More custom content`;

      const parsed = updater.parseFile(content);

      expect(parsed.sections.size).toBe(2);
      expect(parsed.sections.get('shared-lints/core-principles')).toMatchObject({
        name: 'shared-lints/core-principles',
        content: '## Core Principle: Think Before Acting\n\n1. Take a step back',
        version: '1.0.0'
      });
      expect(parsed.sections.get('project-specific')).toMatchObject({
        name: 'project-specific',
        content: '## My Project Rules\n\nCustom rules',
        version: undefined
      });
      
      // Check custom content preservation
      expect(parsed.customContent.get('custom-0')).toContain('# Claude Instructions');
      expect(parsed.customContent.get('custom-1')).toContain('Some custom content here');
      expect(parsed.customContent.get('custom-2')).toContain('More custom content');
    });

    it('should handle files with no sections', () => {
      const content = `# Claude Instructions

Just some regular content
No marked sections here`;

      const parsed = updater.parseFile(content);

      expect(parsed.sections.size).toBe(0);
      expect(parsed.customContent.size).toBe(1);
      expect(parsed.customContent.get('custom-0')).toBe(content);
    });
  });

  describe('init', () => {
    it('should create new CLAUDE.md with default template', async () => {
      await updater.init();

      const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      expect(content).toContain('<!-- BEGIN: shared-lints/core-principles');
      expect(content).toContain('<!-- END: shared-lints/core-principles -->');
      expect(content).toContain('Think Before Acting');
      expect(content).toContain('Project-Specific Instructions');
    });

    it('should throw if file exists without force', async () => {
      await writeFile(join(testDir, 'CLAUDE.md'), 'existing content', 'utf8');

      await expect(updater.init()).rejects.toThrow('already exists');
    });

    it('should overwrite with force flag', async () => {
      await writeFile(join(testDir, 'CLAUDE.md'), 'old content', 'utf8');
      
      await updater.init(true);
      
      const content = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      expect(content).not.toContain('old content');
      expect(content).toContain('Think Before Acting');
    });
  });

  describe('update', () => {
    it('should update marked sections while preserving custom content', async () => {
      // Create initial file with outdated content
      const initialContent = `# My Project Claude Instructions

<!-- BEGIN: shared-lints/core-principles v0.9.0 -->
## Old Principles

Outdated content
<!-- END: shared-lints/core-principles -->

## My Custom Section

This should be preserved

<!-- BEGIN: shared-lints/project-patterns -->
Old patterns
<!-- END: shared-lints/project-patterns -->

## Another Custom Section

Also preserved`;

      await writeFile(join(testDir, 'CLAUDE.md'), initialContent, 'utf8');

      const result = await updater.update();

      expect(result.updated).toContain('shared-lints/core-principles');
      expect(result.updated).toContain('shared-lints/project-patterns');
      expect(result.preserved.length).toBeGreaterThan(0);

      const updatedContent = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      
      // Check updates happened
      expect(updatedContent).toContain('Think Before Acting');
      expect(updatedContent).not.toContain('Outdated content');
      
      // Check custom content preserved
      expect(updatedContent).toContain('# My Project Claude Instructions');
      expect(updatedContent).toContain('## My Custom Section');
      expect(updatedContent).toContain('This should be preserved');
      expect(updatedContent).toContain('## Another Custom Section');
      expect(updatedContent).toContain('Also preserved');
    });

    it('should preserve non-shared-lints marked sections', async () => {
      const content = `# Instructions

<!-- BEGIN: shared-lints/core-principles -->
Will be updated
<!-- END: shared-lints/core-principles -->

<!-- BEGIN: my-company/standards -->
Company specific standards
<!-- END: my-company/standards -->`;

      await writeFile(join(testDir, 'CLAUDE.md'), content, 'utf8');

      const result = await updater.update();

      expect(result.preserved).toContain('my-company/standards');

      const updated = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      expect(updated).toContain('<!-- BEGIN: my-company/standards -->');
      expect(updated).toContain('Company specific standards');
    });

    it('should handle missing target file', async () => {
      await expect(updater.update()).rejects.toThrow('not found');
    });
  });

  describe('checkForUpdates', () => {
    it('should detect outdated sections', async () => {
      const outdatedContent = `<!-- BEGIN: shared-lints/core-principles -->
Old content
<!-- END: shared-lints/core-principles -->`;

      await writeFile(join(testDir, 'CLAUDE.md'), outdatedContent, 'utf8');

      const result = await updater.checkForUpdates();

      expect(result.hasUpdates).toBe(true);
      expect(result.sections).toContain('shared-lints/core-principles');
    });

    it('should detect missing sections', async () => {
      const content = `# CLAUDE.md
Just custom content, no marked sections`;

      await writeFile(join(testDir, 'CLAUDE.md'), content, 'utf8');

      const result = await updater.checkForUpdates();

      expect(result.hasUpdates).toBe(true);
      expect(result.sections).toContain('shared-lints/core-principles');
      expect(result.sections).toContain('shared-lints/project-patterns');
    });

    it('should report no updates when content matches', async () => {
      // First init to get current content
      await updater.init();

      const result = await updater.checkForUpdates();

      expect(result.hasUpdates).toBe(false);
      expect(result.sections).toHaveLength(0);
    });

    it('should handle missing file gracefully', async () => {
      const result = await updater.checkForUpdates();

      expect(result.hasUpdates).toBe(false);
      expect(result.sections).toHaveLength(0);
    });
  });

  describe('user customization scenarios', () => {
    it('should allow inline customization within sections', async () => {
      const customized = `<!-- BEGIN: shared-lints/core-principles -->
## Core Principle: Think Before Acting

1. Take a step back

## Additional Team Principle: Code Reviews
Always get reviews
<!-- END: shared-lints/core-principles -->`;

      await writeFile(join(testDir, 'CLAUDE.md'), customized, 'utf8');

      const result = await updater.update();

      // Should detect as needing update since content differs
      expect(result.updated).toContain('shared-lints/core-principles');

      const updated = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      // User's inline customization is replaced
      expect(updated).not.toContain('Additional Team Principle');
    });

    it('should preserve custom sections between updates', async () => {
      await updater.init();
      
      // User adds custom content
      let content = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      content = content.replace(
        '## Project-Specific Instructions\n\n<!-- Add your project-specific instructions here -->',
        `## Project-Specific Instructions

### API Guidelines
- Always validate input
- Return consistent error formats

### Database Patterns  
- Use transactions for multi-table updates
- Index foreign keys`
      );
      await writeFile(join(testDir, 'CLAUDE.md'), content, 'utf8');

      // Run update
      await updater.update();

      const final = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
      expect(final).toContain('### API Guidelines');
      expect(final).toContain('Always validate input');
      expect(final).toContain('### Database Patterns');
      expect(final).toContain('Use transactions');
    });
  });
});