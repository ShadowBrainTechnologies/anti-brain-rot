import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  SESSION_SECONDS,
  DROP_SIZE,
  fallSpeedFor,
  spawnIntervalFor,
  spawnDrop,
} from './Rainfall.logic.js'

describe('Rainfall.logic', () => {
  it('fallSpeedFor is positive and non-decreasing with elapsed time', () => {
    for (let t = 0; t <= SESSION_SECONDS; t += 5) {
      assert.ok(fallSpeedFor(t) > 0)
      if (t + 5 <= SESSION_SECONDS) {
        assert.ok(fallSpeedFor(t + 5) >= fallSpeedFor(t))
      }
    }
  })

  it('spawnIntervalFor is positive and non-increasing with elapsed time', () => {
    for (let t = 0; t <= SESSION_SECONDS; t += 5) {
      assert.ok(spawnIntervalFor(t) > 0)
      if (t + 5 <= SESSION_SECONDS) {
        assert.ok(spawnIntervalFor(t + 5) <= spawnIntervalFor(t))
      }
    }
  })

  it('spawnDrop places x within [0, arenaWidth] and uses default size and y', () => {
    const drop = spawnDrop(400, () => 0.5)
    assert.ok(drop.x >= 0)
    assert.ok(drop.x <= 400)
    assert.equal(drop.y, 0)
    assert.equal(drop.size, DROP_SIZE)
  })

  it('spawnDrop respects stubbed rng bounds', () => {
    const low = spawnDrop(400, () => 0)
    const high = spawnDrop(400, () => 0.9999)
    assert.ok(low.x >= 0 && low.x <= 400)
    assert.ok(high.x >= 0 && high.x <= 400)
    assert.ok(high.x >= low.x)
  })

  it('spawnDrop keeps drop fully inside narrow arenas', () => {
    const drop = spawnDrop(100, () => 0.5)
    assert.ok(drop.x - DROP_SIZE / 2 >= 0)
    assert.ok(drop.x + DROP_SIZE / 2 <= 100)
  })
})
