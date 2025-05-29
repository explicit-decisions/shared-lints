import { join } from 'path';

// Export the root directory of the monorepo
export const ROOT = join(import.meta.dirname, '..');

// Common paths used across scripts
export const paths = {
  root: ROOT,
  scripts: import.meta.dirname,
  tools: join(ROOT, 'tools'),
  docs: join(ROOT, 'docs'),
  projectMetadata: join(ROOT, 'project-metadata.json'),
  decisionsToml: join(ROOT, 'decisions.toml'),
  packageJson: join(ROOT, 'package.json'),
  depVersions: join(ROOT, 'dependency-versions.json')
};