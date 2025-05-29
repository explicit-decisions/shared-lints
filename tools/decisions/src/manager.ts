import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as TOML from '@iarna/toml';
function createDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export class DecisionsManager {
  #configPath: string;
  
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

  async save(decisions) {
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

      decisions.dependencies = {
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

  async add(category, key, value, reason) {
    const decisions = await this.load();
    
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

  async list() {
    const decisions = await this.load();
    const results = [];
    const today = createDateString();

    for (const [catName, catDecisions] of Object.entries(decisions)) {
      if (catName === 'metadata' || catName === 'defaults') continue;

      for (const [decKey, decision] of Object.entries(catDecisions)) {
        results.push({
          category: catName,
          key: decKey,
          ...decision,
          expired: decision.reviewBy < today
        });
      }
    }

    return results;
  }

  async getExpired() {
    const all = await this.list();
    return all.filter(d => d.expired);
  }
}

export { createDateString };