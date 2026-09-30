/**
 * Runs every calculator test in scripts/calc-tests.
 * Run: npm run validate:calculations   (add -- --verbose to list every check)
 *
 * Each test file checks its calculator against values recorded from the
 * reference calculator, extra values and edge cases, and its input validation.
 */
import { readdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { report } from './calc-tests/harness.mjs'

const testDir = join(dirname(fileURLToPath(import.meta.url)), 'calc-tests')
const files = readdirSync(testDir)
  .filter((file) => file.endsWith('.test.mjs'))
  .sort()

for (const file of files) {
  await import(pathToFileURL(join(testDir, file)).href)
}

const failed = report()
process.exit(failed > 0 ? 1 : 0)
