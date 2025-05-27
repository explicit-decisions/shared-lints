import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

/**
 * Initialize explicit-decisions framework in current project
 */
export async function init() {
  console.log('🚀 Initializing explicit-decisions framework...\n');
  
  const cwd = process.cwd();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Check if package.json exists
    const packageJsonPath = join(cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.error('❌ No package.json found in current directory');
      console.log('💡 Please run this command in a Node.js project root');
      process.exit(1);
    }

    // Read existing package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    console.log('📦 Setting up explicit-decisions framework for:', packageJson.name || 'unnamed project');
    console.log('');

    // Ask what to set up
    const setupESLint = await askQuestion(rl, '🔧 Set up ESLint configuration? (y/n): ');
    const setupDeps = await askQuestion(rl, '📋 Set up dependency management? (y/n): ');
    const setupGitignore = await askQuestion(rl, '📂 Update .gitignore? (y/n): ');

    console.log('\n📝 Setting up your project...\n');

    // Set up ESLint configuration
    if (setupESLint.toLowerCase().startsWith('y')) {
      await setupESLintConfig(cwd, packageJson);
    }

    // Set up dependency management
    if (setupDeps.toLowerCase().startsWith('y')) {
      const { deps } = await import('./deps.js');
      await deps('init');
    }

    // Update .gitignore
    if (setupGitignore.toLowerCase().startsWith('y')) {
      await updateGitignore(cwd);
    }

    // Update package.json scripts
    await updatePackageScripts(packageJsonPath, packageJson, setupDeps.toLowerCase().startsWith('y'));

    console.log('🎉 explicit-decisions framework initialized successfully!\n');
    console.log('🎯 Next steps:');
    console.log('  1. Run `npm run lint` to check your code');
    if (setupDeps.toLowerCase().startsWith('y')) {
      console.log('  2. Run `explicit-decisions deps interactive` to manage dependencies');
    }
    console.log('  3. Review the generated configuration files');
    console.log('  4. Commit your changes\n');

  } finally {
    rl.close();
  }
}

/**
 * Ask a question and return the answer
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Set up ESLint configuration
 */
async function setupESLintConfig(cwd, packageJson) {
  console.log('🔧 Setting up ESLint configuration...');

  // Create eslint.config.js
  const eslintConfig = `import explicitDecisions from '@explicit-decisions/eslint-config';

export default [
  ...explicitDecisions,
  
  // Project-specific overrides
  {
    rules: {
      // Add any project-specific rule overrides here
    }
  }
];`;

  writeFileSync(join(cwd, 'eslint.config.js'), eslintConfig);
  console.log('✅ Created eslint.config.js');

  // Create .eslintignore if it doesn't exist
  const eslintIgnorePath = join(cwd, '.eslintignore');
  if (!existsSync(eslintIgnorePath)) {
    const eslintIgnore = `node_modules/
dist/
build/
coverage/
*.min.js
`;
    writeFileSync(eslintIgnorePath, eslintIgnore);
    console.log('✅ Created .eslintignore');
  }
}

/**
 * Update .gitignore
 */
async function updateGitignore(cwd) {
  console.log('📂 Updating .gitignore...');
  
  const gitignorePath = join(cwd, '.gitignore');
  let gitignoreContent = '';
  
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8');
  }

  // Add explicit-decisions specific ignores
  const explicitDecisionsIgnores = `
# explicit-decisions framework
dependency-versions.json.bak
.ncu-cache/
`;

  if (!gitignoreContent.includes('explicit-decisions framework')) {
    gitignoreContent += explicitDecisionsIgnores;
    writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Updated .gitignore');
  } else {
    console.log('✅ .gitignore already configured');
  }
}

/**
 * Update package.json scripts
 */
async function updatePackageScripts(packageJsonPath, packageJson, includeDeps) {
  console.log('📝 Updating package.json scripts...');

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Add or update lint script
  const lintCommand = includeDeps 
    ? 'explicit-decisions deps check && eslint .'
    : 'eslint .';
    
  packageJson.scripts.lint = lintCommand;
  packageJson.scripts['lint:fix'] = 'eslint . --fix';

  if (includeDeps) {
    packageJson.scripts['deps:check'] = 'explicit-decisions deps check';
    packageJson.scripts['deps:interactive'] = 'explicit-decisions deps interactive';
    packageJson.scripts['deps:init'] = 'explicit-decisions deps init';
  }

  // Add devDependencies
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  packageJson.devDependencies['@explicit-decisions/eslint-config'] = '^1.0.0';
  packageJson.devDependencies['@explicit-decisions/tooling'] = '^1.0.0';
  packageJson.devDependencies['eslint'] = '^9.17.0';

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
}