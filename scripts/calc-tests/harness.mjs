/**
 * Minimal assertion harness for the calculator tests (no dependencies).
 * Reference figures are compared the way the calculators display them:
 * rupees rounded to whole numbers, SIP amounts to paise.
 */

const suites = []
const verbose = process.argv.includes('--verbose')

export function suite(name) {
  const record = { name, passed: 0, failures: [] }
  suites.push(record)

  const check = (label, pass, detail) => {
    if (pass) {
      record.passed++
      if (verbose) console.log(`  ✓ ${name} › ${label}`)
    } else {
      record.failures.push(`${label}: ${detail}`)
    }
  }

  return {
    /** Whole-rupee match, the way results are displayed */
    rupees(label, actual, expected, tolerance = 0) {
      const shown = Math.round(actual)
      check(
        label,
        Number.isFinite(actual) && Math.abs(shown - expected) <= tolerance,
        `expected ₹${expected}, got ${Number.isFinite(actual) ? `₹${shown}` : actual}`
      )
    },
    /** Match to the paisa */
    paise(label, actual, expected) {
      const shown = Math.round(actual * 100) / 100
      check(
        label,
        Number.isFinite(actual) && Math.abs(shown - expected) < 0.005,
        `expected ${expected}, got ${actual}`
      )
    },
    close(label, actual, expected, tolerance) {
      check(
        label,
        Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
        `expected ${expected} ±${tolerance}, got ${actual}`
      )
    },
    equal(label, actual, expected) {
      const pass = JSON.stringify(actual) === JSON.stringify(expected)
      check(label, pass, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    },
    ok(label, condition, detail = 'condition was false') {
      check(label, Boolean(condition), detail)
    },
    /** Every number in a result tree is finite (no NaN / Infinity) */
    finite(label, value) {
      const bad = []
      const walk = (node, path) => {
        if (typeof node === 'number') {
          if (!Number.isFinite(node)) bad.push(`${path}=${node}`)
        } else if (Array.isArray(node)) {
          node.forEach((item, i) => walk(item, `${path}[${i}]`))
        } else if (node && typeof node === 'object') {
          for (const [key, item] of Object.entries(node)) walk(item, `${path}.${key}`)
        }
      }
      walk(value, 'result')
      check(label, bad.length === 0, `non-finite values: ${bad.slice(0, 5).join(', ')}`)
    },
  }
}

export function report() {
  let passed = 0
  let failed = 0
  for (const record of suites) {
    passed += record.passed
    failed += record.failures.length
    const status = record.failures.length ? '✗' : '✓'
    console.log(`${status} ${record.name}: ${record.passed} passed, ${record.failures.length} failed`)
    for (const failure of record.failures) console.log(`    ✗ ${failure}`)
  }
  console.log(`\n${passed} checks passed, ${failed} failed`)
  return failed
}

/** Small deterministic PRNG so "random" extra cases are repeatable */
export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 2 ** 32
  }
}
