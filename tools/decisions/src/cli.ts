import { program } from 'commander';
import { DecisionsManager } from './manager.ts';

const manager = new DecisionsManager();

function handleError(error) {
  console.error('❌', error.message);
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
  .action(async (options) => {
    try {
      await manager.init(options.withExamples);
      console.log('✅ Created decisions.toml');
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('add')
  .description('Add a decision')
  .argument('<category>', 'Category (e.g., dependencies)')
  .argument('<key>', 'Key (e.g., typescript)')
  .argument('<value>', 'Value (e.g., ^5.7.0)')
  .argument('<reason>', 'Reason for decision')
  .action(async (category, key, value, reason) => {
    try {
      await manager.add(category, key, value, reason);
      console.log(`✅ Added ${category}.${key}`);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('list')
  .description('List all decisions')
  .action(async () => {
    try {
      const decisions = await manager.list();
      
      if (decisions.length === 0) {
        console.log('No decisions found.');
        return;
      }

      for (const decision of decisions) {
        const status = decision.expired ? '⚠️ EXPIRED' : '✅';
        console.log(`${status} ${decision.category}.${decision.key}`);
        console.log(`   ${decision.value} - ${decision.reason}`);
        console.log(`   Review: ${decision.reviewBy}`);
        console.log('');
      }
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('check')
  .description('Check for expired decisions (for CI)')
  .action(async () => {
    try {
      const expired = await manager.getExpired();
      
      if (expired.length === 0) {
        console.log('✅ All decisions up to date');
        return;
      }

      console.log(`❌ ${expired.length} expired decision(s):`);
      for (const decision of expired) {
        console.log(`⚠️ ${decision.category}.${decision.key} (${decision.reviewBy})`);
      }
      process.exit(1);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('review')
  .description('Show expired decisions')
  .action(async () => {
    try {
      const expired = await manager.getExpired();
      
      if (expired.length === 0) {
        console.log('✅ No expired decisions');
        return;
      }

      console.log('Expired decisions for review:');
      for (const decision of expired) {
        console.log(`⚠️ ${decision.category}.${decision.key}`);
        console.log(`   ${decision.value} - ${decision.reason}`);
        console.log(`   Expired: ${decision.reviewBy}`);
        console.log('');
      }
    } catch (error) {
      handleError(error);
    }
  });

export { program };