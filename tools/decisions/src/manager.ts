import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import * as TOML from '@iarna/toml';

interface Decision {
  category: string;
  key: string;
  value: string;
  reason: string;
  reviewBy: string;
  expired: boolean;
}

interface DecisionData {
  value: string;
  reason: string;
  reviewBy: string;
}

// Simplified dependency decision - just the essentials
interface DependencyDecision {
  current: string;
  available?: string;
  decision: 'keep' | 'update' | 'deprecate';
  reason: string;
  reviewBy: string;
}

function createDateString(date = new Date()): string {
  const isoString = date.toISOString();
  const datePart = isoString.split('T')[0];
  return datePart || '';
}

export class DecisionsManager {
  readonly #configPath: string;
  
  constructor(configPath: string = 'decisions.toml') {
    this.#configPath = configPath;
  }

  async load() {
    if (!existsSync(this.#configPath)) {
      throw new Error(`Decisions file not found: ${this.#configPath}`);
    }
    
    const content = await readFile(this.#configPath, 'utf8');
    return TOML.parse(content);
  }

  async save(decisions: any): Promise<void> {
    const content = TOML.stringify(decisions);
    await writeFile(this.#configPath, content, 'utf8');
  }

  async init(withExamples = false) {
    if (existsSync(this.#configPath)) {
      throw new Error(`File already exists: ${this.#configPath}`);
    }

    const decisions = {
      metadata: {
        version: '1.0',
        description: 'Technical decisions for this project',
        createdAt: createDateString()
      },
      defaults: {
        reviewAfter: '6m'
      }
    };

    if (withExamples) {
      const reviewDate = new Date();
      reviewDate.setMonth(reviewDate.getMonth() + 6);

      (decisions as any).dependencies = {
        typescript: {
          value: '^5.7.0',
          reason: 'Native .ts import support',
          reviewBy: createDateString(reviewDate),
          decided: createDateString()
        }
      };
    }

    await this.save(decisions);
  }

  async add(category: string, key: string, value: string, reason: string): Promise<void> {
    const decisions: any = await this.load();
    
    if (!decisions[category]) {
      decisions[category] = {};
    }

    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + 6);

    decisions[category][key] = {
      value,
      reason,
      reviewBy: createDateString(reviewDate),
      decided: createDateString()
    };

    await this.save(decisions);
  }

  async list(): Promise<Decision[]> {
    const decisions = await this.load();
    const results: Decision[] = [];
    const today = createDateString();

    for (const [catName, catDecisions] of Object.entries(decisions)) {
      if (catName === 'metadata' || catName === 'defaults') continue;

      if (typeof catDecisions === 'object' && catDecisions !== null && !Array.isArray(catDecisions)) {
        for (const [decKey, decision] of Object.entries(catDecisions as Record<string, unknown>)) {
          if (typeof decision === 'object' && decision !== null && !Array.isArray(decision)) {
            const decisionData = decision as DecisionData;
            results.push({
              category: catName,
              key: decKey,
              value: decisionData.value,
              reason: decisionData.reason,
              reviewBy: decisionData.reviewBy,
              expired: decisionData.reviewBy < today
            });
          }
        }
      }
    }

    return results;
  }

  async getExpired(): Promise<Decision[]> {
    const all = await this.list();
    return all.filter(d => d.expired);
  }


  // Just reuse the general list method with a filter
  async listByCategory(category: string): Promise<Decision[]> {
    const all = await this.list();
    return all.filter(d => d.category === category);
  }
}

export { createDateString };
export type { Decision, DependencyDecision };