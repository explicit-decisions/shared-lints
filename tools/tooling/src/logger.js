/**
 * Simple logger utility for CLI tools
 * 
 * Usage:
 *   import { logger } from '@explicit-decisions/tooling';
 *   logger.info('Message');
 *   logger.error('Error');
 *   logger.debug('Debug info'); // only shows with DEBUG=true
 */

const isQuiet = process.env.QUIET === 'true' || process.env.QUIET === '1';
const isDebug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

export const logger = {
  /**
   * Log info messages (respects QUIET env var)
   */
  info: isQuiet ? () => {} : (...args) => console.log(...args),
  
  /**
   * Log error messages (always shown)
   */
  error: (...args) => console.error(...args),
  
  /**
   * Log debug messages (only shown with DEBUG=true)
   */
  debug: isDebug ? (...args) => console.log('[DEBUG]', ...args) : () => {},
  
  /**
   * Log warning messages (respects QUIET env var)
   */
  warn: isQuiet ? () => {} : (...args) => console.warn(...args),
  
  /**
   * Log success messages with emoji (respects QUIET env var)
   */
  success: isQuiet ? () => {} : (message) => console.log('✅', message),
  
  /**
   * Check if quiet mode is enabled
   */
  isQuiet,
  
  /**
   * Check if debug mode is enabled
   */
  isDebug,
};

// For CLI tools that need raw console access (e.g., interactive prompts)
export const rawConsole = console;