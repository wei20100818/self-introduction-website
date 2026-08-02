export const BOARD_SIZE = 32
export const ENERGY_CORE_DURATION_MS = 8_000
export const HIGH_SCORE_KEY = 'neon-snake-high-score'

export type FoodKind = 'normal' | 'energy'

export interface Point {
  x: number
  y: number
}

export interface Direction {
  x: number
  y: number
}

export interface Food {
  kind: FoodKind
  position: Point
  expiresAt?: number
}

export interface SnakeGameState {
  snake: Point[]
  direction: Direction
  queuedDirection: Direction
  normalFood: Food
  energyFood?: Food
  score: number
  foodEaten: number
  elapsedMs: number
}

export interface AdvanceResult {
  game: SnakeGameState
  gameOver: boolean
}

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
} as const satisfies Record<string, Direction>

function samePoint(first: Point, second: Point): boolean {
  return first.x === second.x && first.y === second.y
}

function pointIsOccupied(point: Point, occupied: Point[]): boolean {
  return occupied.some((item) => samePoint(item, point))
}

function randomBoardPoint(random: () => number): Point {
  return {
    x: Math.floor(random() * BOARD_SIZE),
    y: Math.floor(random() * BOARD_SIZE),
  }
}

export function createFood(kind: FoodKind, occupied: Point[], random: () => number, expiresAt?: number): Food {
  let position = randomBoardPoint(random)

  while (pointIsOccupied(position, occupied)) {
    position = randomBoardPoint(random)
  }

  return { kind, position, expiresAt }
}

export function createInitialGame(random = Math.random): SnakeGameState {
  const snake = [
    { x: 16, y: 16 },
    { x: 15, y: 16 },
    { x: 14, y: 16 },
  ]

  return {
    snake,
    direction: DIRECTIONS.right,
    queuedDirection: DIRECTIONS.right,
    normalFood: createFood('normal', snake, random),
    score: 0,
    foodEaten: 0,
    elapsedMs: 0,
  }
}

export function getSpeed(score: number): number {
  return Math.min(15, 7 + Math.floor(score / 4) * 0.5)
}

export function getStepDuration(score: number): number {
  return 1_000 / getSpeed(score)
}

export function queueDirection(game: SnakeGameState, nextDirection: Direction): SnakeGameState {
  const isReverse = game.direction.x + nextDirection.x === 0 && game.direction.y + nextDirection.y === 0
  if (isReverse) return game

  return { ...game, queuedDirection: nextDirection }
}

export function expireEnergyFood(game: SnakeGameState, now: number): SnakeGameState {
  if (!game.energyFood?.expiresAt || game.energyFood.expiresAt > now) return game

  return { ...game, energyFood: undefined }
}

export function advanceGame(game: SnakeGameState, random: () => number, now: number): AdvanceResult {
  const direction = game.queuedDirection
  const head = game.snake[0]
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y }
  const hitWall = nextHead.x < 0 || nextHead.x >= BOARD_SIZE || nextHead.y < 0 || nextHead.y >= BOARD_SIZE
  const hitSelf = pointIsOccupied(nextHead, game.snake.slice(0, -1))

  if (hitWall || hitSelf) {
    return { game: { ...game, direction }, gameOver: true }
  }

  const ateNormalFood = samePoint(nextHead, game.normalFood.position)
  const ateEnergyFood = game.energyFood && samePoint(nextHead, game.energyFood.position)
  const snake = [nextHead, ...game.snake]
  const occupied = ateNormalFood || ateEnergyFood ? snake : snake.slice(0, -1)
  if (!ateNormalFood && !ateEnergyFood) snake.pop()

  let normalFood = game.normalFood
  let energyFood = game.energyFood
  let score = game.score
  let foodEaten = game.foodEaten

  if (ateNormalFood) {
    score += 1
    foodEaten += 1
    normalFood = createFood('normal', [...occupied, ...(energyFood ? [energyFood.position] : [])], random)

    if (!energyFood && random() < 0.2) {
      energyFood = createFood('energy', [...occupied, normalFood.position], random, now + ENERGY_CORE_DURATION_MS)
    }
  }

  if (ateEnergyFood) {
    score += 3
    foodEaten += 1
    energyFood = undefined
  }

  return {
    game: {
      ...game,
      snake,
      direction,
      queuedDirection: direction,
      normalFood,
      energyFood,
      score,
      foodEaten,
      elapsedMs: game.elapsedMs + getStepDuration(game.score),
    },
    gameOver: false,
  }
}

export function formatDuration(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
