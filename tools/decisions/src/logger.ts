// Simple logger for CLI output

interface LogLevel {
  QUIET: boolean;
  DEBUG: boolean;
}

const logLevel: LogLevel = {
  QUIET: process.env['QUIET'] === 'true' || process.argv.includes('--quiet'),
  DEBUG: process.env['DEBUG'] === 'true' || process.argv.includes('--debug')
};

export const logger = {
  info: (...args: unknown[]): void => {
    if (!logLevel.QUIET) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  success: (...args: unknown[]): void => {
    if (!logLevel.QUIET) {
      console.log('✓', ...args);
    }
  },
  warning: (...args: unknown[]): void => {
    if (!logLevel.QUIET) {
      console.warn('⚠', ...args);
    }
  },
  debug: (message: string): void => {
    if (logLevel.DEBUG) {
      console.log('[DEBUG]', message);
    }
  }
};