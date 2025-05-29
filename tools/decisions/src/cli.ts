import { program } from 'commander';
import { logger } from '../../tooling/src/logger.js';

import { DecisionsManager } from './manager.ts';

const manager = new DecisionsManager();

function handleError(error: Error): void {
  logger.error('❌', error.message);
  process.exit(1);
}

program
  .name('decisions')
  .description('Track technical decisions in TOML format')
  .version('0.1.0');

program
  .command('init')
  .description('Create decisions.toml')
  .option('--with-examples', 'Include example')
  .action(async (options: { withExamples?: boolean }) => {
    try {
      await manager.init(options.withExamples ?? false);
      logger.success('Created decisions.toml');
    } catch (error) {
      handleError(error as Error);
    }
  });

program
  .command('add')
  .description('Add a decision')
  .argument('<category>', 'Category (e.g., dependencies)')
  .argument('<key>', 'Key (e.g., typescript)')
  .argument('<value>', 'Value (e.g., ^5.7.0)')
  .argument('<reason>', 'Reason for decision')
  .action(async (category: string, key: string, value: string, reason: string) => {
    try {
      await manager.add(category, key, value, reason);
      logger.success(`Added ${category}.${key}`);
    } catch (error) {
      handleError(error as Error);
    }
  });

program
  .command('list')
  .description('List all decisions')
  .action(async () => {
    try {
      const decisions = await manager.list();
      
      if (decisions.length === 0) {
        logger.info('No decisions found.');
        return;
      }

      for (const decision of decisions) {
        const status = decision.expired ? '⚠️ EXPIRED' : '✅';
        logger.info(`${status} ${decision.category}.${decision.key}`);
        logger.info(`   ${decision.value} - ${decision.reason}`);
        logger.info(`   Review: ${decision.reviewBy}`);
        logger.info('');
      }
    } catch (error) {
      handleError(error as Error);
    }
  });

program
  .command('check')
  .description('Check for expired decisions (for CI)')
  .action(async () => {
    try {
      const expired = await manager.getExpired();
      
      if (expired.length === 0) {
        logger.success('All decisions up to date');
        return;
      }

      logger.error(`❌ ${expired.length} expired decision(s):`);
      for (const decision of expired) {
        logger.warn(`⚠️ ${decision.category}.${decision.key} (${decision.reviewBy})`);
      }
      process.exit(1);
    } catch (error) {
      handleError(error as Error);
    }
  });

program
  .command('review')
  .description('Show expired decisions')
  .action(async () => {
    try {
      const expired = await manager.getExpired();
      
      if (expired.length === 0) {
        logger.success('No expired decisions');
        return;
      }

      logger.info('Expired decisions for review:');
      for (const decision of expired) {
        logger.warn(`⚠️ ${decision.category}.${decision.key}`);
        logger.info(`   ${decision.value} - ${decision.reason}`);
        logger.info(`   Expired: ${decision.reviewBy}`);
        logger.info('');
      }
    } catch (error) {
      handleError(error as Error);
    }
  });

export { program };