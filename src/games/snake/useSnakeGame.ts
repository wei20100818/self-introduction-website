import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DIRECTIONS,
  HIGH_SCORE_KEY,
  advanceGame,
  createInitialGame,
  expireEnergyFood,
  getStepDuration,
  queueDirection,
  type Direction,
  type SnakeGameState,
} from './engine'

export type SnakeGameStatus = 'intro' | 'running' | 'paused' | 'game-over'

function readHighScore(): number {
  const storedScore = window.localStorage.getItem(HIGH_SCORE_KEY)
  const score = Number.parseInt(storedScore ?? '', 10)
  return Number.isFinite(score) && score > 0 ? score : 0
}

export function useSnakeGame() {
  const [status, setStatus] = useState<SnakeGameStatus>('intro')
  const [game, setGame] = useState<SnakeGameState>(() => createInitialGame())
  const [highScore, setHighScore] = useState(readHighScore)
  const gameRef = useRef(game)
  const statusRef = useRef(status)
  const lastStepAtRef = useRef<number | null>(null)
  const pausedAtRef = useRef<number | null>(null)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const startGame = useCallback(() => {
    const nextGame = createInitialGame()
    gameRef.current = nextGame
    lastStepAtRef.current = performance.now()
    setGame(nextGame)
    setStatus('running')
  }, [])

  const returnToIntro = useCallback(() => {
    lastStepAtRef.current = null
    pausedAtRef.current = null
    setGame(createInitialGame())
    setStatus('intro')
  }, [])

  const pauseGame = useCallback(() => {
    if (statusRef.current === 'running') {
      pausedAtRef.current = Date.now()
      setStatus('paused')
    }
  }, [])

  const togglePause = useCallback(() => {
    if (statusRef.current === 'running') {
      pauseGame()
      return
    }

    if (statusRef.current === 'paused') {
      const pausedDuration = pausedAtRef.current === null ? 0 : Date.now() - pausedAtRef.current
      pausedAtRef.current = null
      lastStepAtRef.current = performance.now()

      if (pausedDuration > 0 && gameRef.current.energyFood?.expiresAt) {
        const resumedGame = {
          ...gameRef.current,
          energyFood: {
            ...gameRef.current.energyFood,
            expiresAt: gameRef.current.energyFood.expiresAt + pausedDuration,
          },
        }
        gameRef.current = resumedGame
        setGame(resumedGame)
      }

      setStatus('running')
    }
  }, [pauseGame])

  const changeDirection = useCallback((direction: Direction) => {
    if (statusRef.current !== 'running') return

    setGame((currentGame) => queueDirection(currentGame, direction))
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const directionByKey: Record<string, Direction> = {
        w: DIRECTIONS.up,
        a: DIRECTIONS.left,
        s: DIRECTIONS.down,
        d: DIRECTIONS.right,
      }
      const direction = directionByKey[event.key.toLowerCase()]

      if (direction) {
        event.preventDefault()
        changeDirection(direction)
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        togglePause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeDirection, togglePause])

  useEffect(() => {
    let animationFrame = 0

    const frame = (now: number) => {
      if (statusRef.current === 'running') {
        const lastStepAt = lastStepAtRef.current ?? now
        const gameBeforeStep = expireEnergyFood(gameRef.current, Date.now())
        const stepDuration = getStepDuration(gameBeforeStep.score)

        if (now - lastStepAt >= stepDuration) {
          const result = advanceGame(gameBeforeStep, Math.random, Date.now())
          gameRef.current = result.game
          lastStepAtRef.current = now
          setGame(result.game)

          if (result.gameOver) {
            const nextHighScore = Math.max(highScore, result.game.score)
            if (nextHighScore > highScore) {
              window.localStorage.setItem(HIGH_SCORE_KEY, String(nextHighScore))
              setHighScore(nextHighScore)
            }
            setStatus('game-over')
          }
        } else if (gameBeforeStep !== gameRef.current) {
          gameRef.current = gameBeforeStep
          setGame(gameBeforeStep)
        }
      }

      animationFrame = window.requestAnimationFrame(frame)
    }

    animationFrame = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [highScore])

  useEffect(() => {
    const pauseOnHiddenTab = () => {
      if (document.visibilityState === 'hidden') pauseGame()
    }

    document.addEventListener('visibilitychange', pauseOnHiddenTab)
    return () => document.removeEventListener('visibilitychange', pauseOnHiddenTab)
  }, [pauseGame])

  return {
    changeDirection,
    game,
    highScore,
    returnToIntro,
    startGame,
    status,
    togglePause,
  }
}
