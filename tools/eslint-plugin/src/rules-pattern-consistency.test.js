// @ts-check

import { RuleTester } from "@typescript-eslint/rule-tester";
import { describe, it } from "vitest";

import { noMixedAsyncPatterns } from "./rules/no-mixed-async-patterns.ts";
import { noInconsistentImportExtensions } from "./rules/no-inconsistent-import-extensions.ts";
import { noDuplicateUtilities } from "./rules/no-duplicate-utilities.ts";
import { noOutdatedPolyfills } from "./rules/no-outdated-polyfills.ts";

// Configure rule tester for modern ESLint/TypeScript
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

describe("Pattern Consistency Rules", () => {
  describe("no-mixed-async-patterns", () => {
    it("should detect mixed async patterns within a file", () => {
      ruleTester.run("no-mixed-async-patterns", noMixedAsyncPatterns, {
        valid: [
          {
            // Consistent async/await usage
            code: `
              async function fetchUser(id) {
                const response = await fetch(\`/users/\${id}\`);
                return response.json();
              }
              
              async function updateUser(id, data) {
                const response = await fetch(\`/users/\${id}\`, { method: 'PUT', body: JSON.stringify(data) });
                return response.json();
              }
            `,
          },
          {
            // Consistent promise usage
            code: `
              function fetchUser(id) {
                return fetch(\`/users/\${id}\`).then(r => r.json());
              }
              
              function updateUser(id, data) {
                return fetch(\`/users/\${id}\`, { method: 'PUT', body: JSON.stringify(data) })
                  .then(r => r.json());
              }
            `,
          },
          {
            // Consistent callback usage
            code: `
              function fetchUser(id, callback) {
                apiCall(\`/users/\${id}\`, callback);
              }
              
              function updateUser(id, data, done) {
                apiCall(\`/users/\${id}\`, { method: 'PUT', data }, done);
              }
            `,
          },
          {
            // Single function is allowed to use any pattern
            code: `
              async function fetchUser(id) {
                const response = await fetch(\`/users/\${id}\`);
                return response.json();
              }
            `,
          },
        ],
        invalid: [
          {
            // Mixing async/await with promises
            code: `
              async function fetchUser(id) {
                const response = await fetch(\`/users/\${id}\`);
                return response.json();
              }
              
              function updateUser(id, data) {
                return fetch(\`/users/\${id}\`, { method: 'PUT', body: JSON.stringify(data) })
                  .then(r => r.json());
              }
            `,
            errors: [
              { messageId: 'mixedAsyncPatterns' },
              { messageId: 'mixedAsyncPatterns' }
            ],
          },
          {
            // Mixing callbacks with async/await
            code: `
              function loadData(callback) {
                fs.readFile('data.json', callback);
              }
              
              async function saveData(data) {
                await fs.promises.writeFile('data.json', JSON.stringify(data));
              }
            `,
            errors: [
              { messageId: 'mixedAsyncPatterns' },
              { messageId: 'mixedAsyncPatterns' }
            ],
          },
          {
            // All three patterns mixed
            code: `
              function fetchWithCallback(id, cb) {
                apiCall(\`/users/\${id}\`, cb);
              }
              
              function fetchWithPromise(id) {
                return fetch(\`/users/\${id}\`).then(r => r.json());
              }
              
              async function fetchWithAsync(id) {
                const response = await fetch(\`/users/\${id}\`);
                return response.json();
              }
            `,
            errors: [
              { messageId: 'mixedAsyncPatterns' },
              { messageId: 'mixedAsyncPatterns' },
              { messageId: 'mixedAsyncPatterns' }
            ],
          },
        ],
      });
    });
  });

  describe("no-inconsistent-import-extensions", () => {
    it("should detect inconsistent import extension usage", () => {
      ruleTester.run("no-inconsistent-import-extensions", noInconsistentImportExtensions, {
        valid: [
          {
            // Consistent - all with extensions
            code: `
              import { helper } from './utils/helper.js';
              import { config } from './config/settings.ts';
              import { logger } from '../services/logger.js';
            `,
          },
          {
            // Consistent - all without extensions
            code: `
              import { helper } from './utils/helper';
              import { config } from './config/settings';
              import { logger } from '../services/logger';
            `,
          },
          {
            // Non-relative imports are ignored
            code: `
              import { helper } from './utils/helper.js';
              import express from 'express';
              import { config } from './config/settings.js';
            `,
          },
          {
            // Single import is always valid
            code: `
              import { helper } from './utils/helper.js';
            `,
          },
        ],
        invalid: [
          {
            // Mixed extensions
            code: `
              import { helper } from './utils/helper';
              import { config } from './config/settings.js';
              import { logger } from '../services/logger';
              import { database } from './db/connection.ts';
            `,
            errors: [
              { messageId: 'inconsistentImportExtensions' },
              { messageId: 'inconsistentImportExtensions' }
            ],
          },
          {
            // Some with, some without
            code: `
              import { UserModel } from './models/user';
              import { PostModel } from './models/post.js';
            `,
            errors: [
              { messageId: 'inconsistentImportExtensions' }
            ],
          },
        ],
      });
    });
  });

  describe("no-duplicate-utilities", () => {
    it("should detect duplicate utility functions", () => {
      ruleTester.run("no-duplicate-utilities", noDuplicateUtilities, {
        valid: [
          {
            // Different function signatures
            code: `
              function validateEmail(email) {
                return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
              }
              
              function validatePhone(phone, countryCode) {
                return /^\\+?[1-9]\\d{1,14}$/.test(phone);
              }
            `,
          },
          {
            // Same base name but different param counts
            code: `
              function formatDate(date) {
                return date.toISOString();
              }
              
              function formatDateWithLocale(date, locale) {
                return date.toLocaleDateString(locale);
              }
            `,
          },
          {
            // Not similar enough names
            code: `
              function getUserName(user) {
                return user.name;
              }
              
              function setUserName(user, name) {
                user.name = name;
              }
            `,
          },
        ],
        invalid: [
          {
            // Same pattern, different entity names
            code: `
              function validateUserEmail(email) {
                return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
              }
              
              function validateCompanyEmail(email) {
                return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
              }
            `,
            errors: [
              { messageId: 'duplicateUtility', data: { similar: 'validateUserEmail' } }
            ],
          },
          {
            // Similar formatting functions
            code: `
              function formatUserDate(date) {
                return date.toISOString().split('T')[0];
              }
              
              function formatOrderDate(date) {
                return date.toISOString().split('T')[0];
              }
            `,
            errors: [
              { messageId: 'duplicateUtility', data: { similar: 'formatUserDate' } }
            ],
          },
          {
            // Function expressions with similar patterns
            code: `
              const parseUserJson = function(json) {
                return JSON.parse(json);
              };
              
              const parseCompanyJson = function(json) {
                return JSON.parse(json);
              };
            `,
            errors: [
              { messageId: 'duplicateUtility', data: { similar: 'parseUserJson' } }
            ],
          },
        ],
      });
    });
  });

  describe("no-outdated-polyfills", () => {
    it("should detect outdated polyfill patterns", () => {
      ruleTester.run("no-outdated-polyfills", noOutdatedPolyfills, {
        valid: [
          {
            // Modern __dirname usage
            code: `
              const __dirname = import.meta.dirname;
              const configPath = path.join(__dirname, 'config.json');
            `,
          },
          {
            // Modern JSON import
            code: `
              import packageData from './package.json' with { type: 'json' };
            `,
          },
          {
            // Modern array conversion
            code: `
              const argsArray = Array.from(arguments);
              const nodeArray = [...document.querySelectorAll('div')];
            `,
          },
          {
            // Modern async/await
            code: `
              async function delay() {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            `,
          },
        ],
        invalid: [
          {
            // Old __dirname polyfill
            code: `
              import { dirname } from 'path';
              import { fileURLToPath } from 'url';
              const __dirname = dirname(fileURLToPath(import.meta.url));
            `,
            errors: [
              { 
                messageId: 'outdatedPolyfill',
                data: {
                  pattern: '__dirname = dirname(fileURLToPath(import.meta.url))',
                  modern: 'import.meta.dirname'
                }
              }
            ],
          },
          {
            // Promise.resolve().then() pattern
            code: `
              Promise.resolve().then(() => {
                console.log('Next tick');
              });
            `,
            errors: [
              { 
                messageId: 'outdatedPolyfill',
                data: {
                  pattern: 'Promise.resolve().then()',
                  modern: 'async/await'
                }
              }
            ],
          },
          {
            // Array.prototype.slice.call pattern
            code: `
              function toArray(arrayLike) {
                return Array.prototype.slice.call(arrayLike);
              }
            `,
            errors: [
              { 
                messageId: 'outdatedPolyfill',
                data: {
                  pattern: 'Array.prototype.slice.call()',
                  modern: 'Array.from() or spread syntax [...args]'
                }
              }
            ],
          },
          {
            // JSON.parse(readFileSync) for .json files
            code: `
              const data = JSON.parse(readFileSync('./config.json', 'utf8'));
            `,
            errors: [
              { 
                messageId: 'outdatedPolyfill',
                data: {
                  pattern: 'JSON.parse(readFileSync(...json))',
                  modern: 'import data from "./file.json" with { type: "json" }'
                }
              }
            ],
          },
        ],
      });
    });
  });
});