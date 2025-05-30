/**
 * CLAUDE.md updater - manages composable sections in AI instructions
 */

import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface Section {
  name: string;
  content: string;
  version: string | undefined;
}

interface ParsedClaudeFile {
  sections: Map<string, Section>;
  customContent: Map<string, string>;
  fullContent: string;
}

export class ClaudeUpdater {
  readonly #sourcePath: string;
  readonly #targetPath: string;

  constructor(
    sourcePath = join(import.meta.dirname, '../../../CLAUDE.md'),
    targetPath = 'CLAUDE.md'
  ) {
    this.#sourcePath = sourcePath;
    this.#targetPath = targetPath;
  }

  /**
   * Parse a CLAUDE.md file into sections
   */
  parseFile(content: string): ParsedClaudeFile {
    const sections = new Map<string, Section>();
    const customContent = new Map<string, string>();
    
    // Match sections with pattern: <!-- BEGIN: section-name -->...<!-- END: section-name -->
    const sectionRegex = /<!-- BEGIN: ([\w-\/]+)(?:\s+v([\d.]+))? -->(.+?)<!-- END: \1 -->/gs;
    
    let lastIndex = 0;
    let match;
    let sectionIndex = 0;
    
    while ((match = sectionRegex.exec(content)) !== null) {
      const [fullMatch, sectionName, version, sectionContent] = match;
      
      // Store any content before this section as custom content
      if (match.index > lastIndex) {
        customContent.set(`custom-${sectionIndex}`, content.slice(lastIndex, match.index));
      }
      
      sections.set(sectionName ?? '', {
        name: sectionName ?? '',
        content: sectionContent?.trim() ?? '',
        version
      });
      
      lastIndex = match.index + fullMatch.length;
      sectionIndex++;
    }
    
    // Store any remaining content
    if (lastIndex < content.length) {
      customContent.set(`custom-${sectionIndex}`, content.slice(lastIndex));
    }
    
    return {
      sections,
      customContent,
      fullContent: content
    };
  }

  /**
   * Get the default CLAUDE.md template with marked sections
   */
  async getDefaultTemplate(): Promise<string> {
    const coreInstructions = await this.getCoreInstructions();
    
    return `# Claude Instructions

<!-- BEGIN: shared-lints/core-principles v1.0.0 -->
${coreInstructions['corePrinciples']}
<!-- END: shared-lints/core-principles -->

<!-- BEGIN: shared-lints/project-patterns v1.0.0 -->
${coreInstructions['projectPatterns']}
<!-- END: shared-lints/project-patterns -->

## Project-Specific Instructions

<!-- Add your project-specific instructions here -->
<!-- These will be preserved during updates -->

## Custom Patterns

<!-- Document patterns specific to your codebase -->
`;
  }

  /**
   * Get core instructions from shared-lints
   */
  async getCoreInstructions(): Promise<Record<string, string>> {
    const sourcePath = this.#sourcePath;
    
    try {
      const content = await readFile(sourcePath, 'utf8');
      const parsed = this.parseFile(content);
      
      // Extract specific sections or use full content
      const corePrinciplesSection = parsed.sections.get('shared-lints/core-principles');
      const projectPatternsSection = parsed.sections.get('shared-lints/project-patterns');
      
      const corePrinciplesMatch = /## Core Principle:.+?(?=##|\n## |\z)/s.exec(content);
      const projectPatternsMatch = /## Project Patterns.+?(?=##|\n## |\z)/s.exec(content);
      
      return {
        corePrinciples: corePrinciplesSection?.content ?? corePrinciplesMatch?.[0] ?? '',
        projectPatterns: projectPatternsSection?.content ?? projectPatternsMatch?.[0] ?? ''
      };
    } catch {
      // Return default content if source doesn't exist
      return {
        corePrinciples: `## Core Principle: Think Before Acting

**Before implementing any solution:**

1. Take a step back and think through the problem
2. Make sure you're actually focused on the right thing
3. If you're not sure, ASK - don't guess
4. If you're hitting a problem, get to the bottom of it rather than mashing on it until it works

This principle prevents "vibe coding" and ensures explicit, thoughtful decisions.`,
        
        projectPatterns: `## Project Patterns

### Dependency Management

All dependencies must be tracked in decisions.toml with explicit decisions.

### Testing Philosophy

- No mocks or spies - use real implementations
- Factory functions for test data
- In-memory implementations for external services`
      };
    }
  }

  /**
   * Initialize a new CLAUDE.md file
   */
  async init(force = false): Promise<void> {
    if (existsSync(this.#targetPath) && !force) {
      throw new Error(`${this.#targetPath} already exists. Use --force to overwrite.`);
    }
    
    const template = await this.getDefaultTemplate();
    await writeFile(this.#targetPath, template, 'utf8');
  }

  /**
   * Update marked sections in existing CLAUDE.md
   */
  async update(): Promise<{ updated: string[]; preserved: string[] }> {
    if (!existsSync(this.#targetPath)) {
      throw new Error(`${this.#targetPath} not found. Run 'init' first.`);
    }
    
    const currentContent = await readFile(this.#targetPath, 'utf8');
    const parsed = this.parseFile(currentContent);
    const coreInstructions = await this.getCoreInstructions();
    
    const updated: string[] = [];
    const preserved: string[] = [];
    
    // Build updated content
    let newContent = '';
    let sectionIndex = 0;
    
    // Process in order, maintaining structure
    const processedSections = new Set<string>();
    
    // First, add any leading custom content
    const leadingCustom = parsed.customContent.get('custom-0');
    if (leadingCustom) {
      newContent += leadingCustom;
    }
    
    // Update shared-lints sections
    const sectionUpdates = [
      { name: 'shared-lints/core-principles', content: coreInstructions['corePrinciples'] },
      { name: 'shared-lints/project-patterns', content: coreInstructions['projectPatterns'] }
    ];
    
    for (const { name, content } of sectionUpdates) {
      if (parsed.sections.has(name)) {
        // Update existing section
        newContent += `<!-- BEGIN: ${name} v1.0.0 -->\n${content}\n<!-- END: ${name} -->\n`;
        updated.push(name);
        processedSections.add(name);
        
        // Add any custom content that follows this section
        sectionIndex++;
        const customKey = `custom-${sectionIndex}`;
        if (parsed.customContent.has(customKey)) {
          newContent += parsed.customContent.get(customKey);
          preserved.push(`Custom content after ${name}`);
        }
      }
    }
    
    // Preserve any other marked sections
    for (const [name, section] of parsed.sections) {
      if (!processedSections.has(name)) {
        newContent += `<!-- BEGIN: ${name}${section.version ? ` v${section.version}` : ''} -->\n`;
        newContent += section.content + '\n';
        newContent += `<!-- END: ${name} -->\n`;
        preserved.push(name);
      }
    }
    
    // Add any trailing custom content
    const remainingCustom = Array.from(parsed.customContent.entries())
      .filter(([key]) => {
        const keyIndex = parseInt(key.split('-')[1] ?? '0');
        return keyIndex > sectionIndex;
      })
      .map(([, content]) => content)
      .join('');
    
    if (remainingCustom) {
      newContent += remainingCustom;
    }
    
    await writeFile(this.#targetPath, newContent, 'utf8');
    
    return { updated, preserved };
  }

  /**
   * Check if updates are available
   */
  async checkForUpdates(): Promise<{ hasUpdates: boolean; sections: string[] }> {
    if (!existsSync(this.#targetPath)) {
      return { hasUpdates: false, sections: [] };
    }
    
    const currentContent = await readFile(this.#targetPath, 'utf8');
    const parsed = this.parseFile(currentContent);
    const coreInstructions = await this.getCoreInstructions();
    
    const outdatedSections: string[] = [];
    
    // Check each shared-lints section
    const checks = [
      { name: 'shared-lints/core-principles', latest: coreInstructions['corePrinciples'] },
      { name: 'shared-lints/project-patterns', latest: coreInstructions['projectPatterns'] }
    ];
    
    for (const { name, latest } of checks) {
      const current = parsed.sections.get(name);
      if (!current || current.content.trim() !== latest?.trim()) {
        outdatedSections.push(name);
      }
    }
    
    return {
      hasUpdates: outdatedSections.length > 0,
      sections: outdatedSections
    };
  }
}