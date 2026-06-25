import assert from "node:assert/strict"
import { test } from "node:test"

import { computeNewTotal, crossesThreshold } from "./threshold.ts"

const THRESHOLD = 1000

test("sous le seuil : 600 + 300 = 900 < 1000", () => {
  const total = computeNewTotal(600, 300, 0, false)
  assert.equal(total, 900)
  assert.equal(crossesThreshold(total, THRESHOLD), false)
})

test("exactement au seuil : 700 + 300 = 1000 ≥ 1000", () => {
  const total = computeNewTotal(700, 300, 0, false)
  assert.equal(total, 1000)
  assert.equal(crossesThreshold(total, THRESHOLD), true)
})

test("au-dessus du seuil : existant 200 + 300 cash + 900 avantage = 1400 > 1000", () => {
  const total = computeNewTotal(200, 300, 900, true)
  assert.equal(total, 1400)
  assert.equal(crossesThreshold(total, THRESHOLD), true)
})

test("avantage en nature ignoré si la case n'est pas cochée", () => {
  const total = computeNewTotal(500, 200, 900, false)
  assert.equal(total, 700)
  assert.equal(crossesThreshold(total, THRESHOLD), false)
})
