import { describe, expect, it } from 'vitest'

import {
  DIRECTIONS,
  advanceGame,
  createInitialGame,
  expireEnergyFood,
  queueDirection,
  type SnakeGameState,
} from './engine'

const predictableRandom = () => 0.25

describe('snake engine', () => {
  it('never places initial food on the snake', () => {
    const game = createInitialGame(predictableRandom)

    expect(game.snake).not.toContainEqual(game.normalFood.position)
  })

  it('rejects an immediate reverse direction', () => {
    const game = createInitialGame(predictableRandom)
    const nextGame = queueDirection(game, DIRECTIONS.left)

    expect(nextGame.queuedDirection).toEqual(DIRECTIONS.right)
  })

  it('grows the snake and increments score after eating normal food', () => {
    const game: SnakeGameState = {
      snake: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
      direction: DIRECTIONS.right,
      queuedDirection: DIRECTIONS.right,
      normalFood: { kind: 'normal', position: { x: 5, y: 4 } },
      score: 0,
      foodEaten: 0,
      elapsedMs: 0,
    }

    const result = advanceGame(game, predictableRandom, 1_000)

    expect(result.gameOver).toBe(false)
    expect(result.game.snake).toHaveLength(4)
    expect(result.game.score).toBe(1)
    expect(result.game.foodEaten).toBe(1)
  })

  it('ends the game when the next movement crosses the wall', () => {
    const game: SnakeGameState = {
      snake: [{ x: 31, y: 5 }, { x: 30, y: 5 }, { x: 29, y: 5 }],
      direction: DIRECTIONS.right,
      queuedDirection: DIRECTIONS.right,
      normalFood: { kind: 'normal', position: { x: 12, y: 12 } },
      score: 4,
      foodEaten: 4,
      elapsedMs: 1_000,
    }

    expect(advanceGame(game, predictableRandom, 2_000).gameOver).toBe(true)
  })

  it('grows the snake and awards three points after eating an energy core', () => {
    const game: SnakeGameState = {
      snake: [{ x: 4, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 4 }],
      direction: DIRECTIONS.right,
      queuedDirection: DIRECTIONS.right,
      normalFood: { kind: 'normal', position: { x: 14, y: 14 } },
      energyFood: { kind: 'energy', position: { x: 5, y: 4 }, expiresAt: 2_000 },
      score: 2,
      foodEaten: 2,
      elapsedMs: 0,
    }

    const result = advanceGame(game, predictableRandom, 1_000)

    expect(result.gameOver).toBe(false)
    expect(result.game.snake).toHaveLength(4)
    expect(result.game.score).toBe(5)
    expect(result.game.foodEaten).toBe(3)
    expect(result.game.energyFood).toBeUndefined()
  })

  it('removes an expired energy core', () => {
    const game = {
      ...createInitialGame(predictableRandom),
      energyFood: { kind: 'energy' as const, position: { x: 9, y: 9 }, expiresAt: 2_000 },
    }

    expect(expireEnergyFood(game, 2_000).energyFood).toBeUndefined()
    expect(expireEnergyFood(game, 1_999).energyFood).toEqual(game.energyFood)
  })
})
