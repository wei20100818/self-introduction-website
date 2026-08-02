import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { BOARD_SIZE, getStepDuration, type Point, type SnakeGameState } from './engine'

interface SnakeBoardProps {
  animate: boolean
  game: SnakeGameState
  onSwipe: (deltaX: number, deltaY: number) => void
}

interface CanvasMetrics {
  pixelRatio: number
  size: number
}

function interpolatePoint(previous: Point | undefined, current: Point, progress: number): Point {
  if (!previous) return current

  return {
    x: previous.x + (current.x - previous.x) * progress,
    y: previous.y + (current.y - previous.y) * progress,
  }
}

function drawBoard(
  canvas: HTMLCanvasElement,
  game: SnakeGameState,
  previousSnake: Point[],
  progress: number,
  timestamp: number,
  metrics: CanvasMetrics,
) {
  const context = canvas.getContext('2d')
  if (!context) return

  const { pixelRatio, size } = metrics
  const cellSize = size / BOARD_SIZE
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, size, size)

  const boardGradient = context.createLinearGradient(0, 0, size, size)
  boardGradient.addColorStop(0, '#fafdff')
  boardGradient.addColorStop(0.55, '#f1faff')
  boardGradient.addColorStop(1, '#f8f5ff')
  context.fillStyle = boardGradient
  context.fillRect(0, 0, size, size)

  const lightSweep = (Math.sin(timestamp / 3_000) + 1) / 2
  const gridGradient = context.createLinearGradient(0, 0, size, size)
  gridGradient.addColorStop(0, `rgba(46, 195, 234, ${0.08 + lightSweep * 0.025})`)
  gridGradient.addColorStop(1, 'rgba(113, 86, 227, 0.08)')
  context.strokeStyle = gridGradient
  context.lineWidth = Math.max(1, size / 1_100)
  for (let index = 1; index < BOARD_SIZE; index += 1) {
    const offset = index * cellSize
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset, size)
    context.moveTo(0, offset)
    context.lineTo(size, offset)
    context.stroke()
  }

  const drawCore = (point: Point, color: string, glow: string, radius: number, ring = false) => {
    const centerX = (point.x + 0.5) * cellSize
    const centerY = (point.y + 0.5) * cellSize
    context.save()
    context.shadowBlur = cellSize * 0.9
    context.shadowColor = glow
    context.fillStyle = color
    context.beginPath()
    context.arc(centerX, centerY, cellSize * radius, 0, Math.PI * 2)
    context.fill()

    if (ring) {
      context.lineWidth = Math.max(1.5, cellSize * 0.08)
      context.strokeStyle = 'rgba(113, 77, 240, 0.65)'
      context.beginPath()
      context.arc(centerX, centerY, cellSize * 0.39, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ((timestamp % 1_000) / 1_000))
      context.stroke()
    }
    context.restore()
  }

  drawCore(game.normalFood.position, '#2fd4e7', '#1dc8e4', 0.23)
  if (game.energyFood) drawCore(game.energyFood.position, '#8a60ff', '#8a60ff', 0.25, true)

  game.snake.forEach((segment, index) => {
    const position = interpolatePoint(previousSnake[index], segment, progress)
    const inset = cellSize * (index === 0 ? 0.105 : 0.16)
    const fill = index === 0 ? '#168fca' : `hsl(${187 + Math.min(index, 10) * 1.1} 74% ${58 - Math.min(index, 12) * 0.45}%)`
    context.save()
    context.fillStyle = fill
    context.shadowBlur = index === 0 ? cellSize * 0.7 : cellSize * 0.34
    context.shadowColor = '#2dd5e9'
    context.beginPath()
    context.roundRect(
      position.x * cellSize + inset,
      position.y * cellSize + inset,
      cellSize - inset * 2,
      cellSize - inset * 2,
      cellSize * 0.22,
    )
    context.fill()

    if (index === 0) {
      const eyeOffsetX = game.direction.x * cellSize * 0.18
      const eyeOffsetY = game.direction.y * cellSize * 0.18
      context.fillStyle = '#efffff'
      context.shadowBlur = 0
      context.beginPath()
      context.arc((position.x + 0.5) * cellSize + eyeOffsetX, (position.y + 0.5) * cellSize + eyeOffsetY, cellSize * 0.1, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
  })
}

export function SnakeBoard({ animate, game, onSwipe }: SnakeBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const gameRef = useRef(game)
  const previousSnakeRef = useRef(game.snake)
  const lastMoveAtRef = useRef(0)
  const reduceMotion = useReducedMotion()
  const [metrics, setMetrics] = useState<CanvasMetrics>({ pixelRatio: 1, size: 640 })

  useEffect(() => {
    lastMoveAtRef.current = performance.now()
  }, [])

  useEffect(() => {
    const previousGame = gameRef.current
    const didMove = previousGame.snake[0].x !== game.snake[0].x || previousGame.snake[0].y !== game.snake[0].y
    if (didMove) {
      previousSnakeRef.current = previousGame.snake
      lastMoveAtRef.current = performance.now()
    }
    gameRef.current = game
  }, [game])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const size = Math.max(320, Math.round(canvas.getBoundingClientRect().width || 640))
      setMetrics({ pixelRatio: Math.min(window.devicePixelRatio || 1, 2), size })
    }

    updateCanvasSize()
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateCanvasSize)
    resizeObserver?.observe(canvas)
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  useEffect(() => {
    let animationFrame = 0
    const draw = (timestamp: number) => {
      const currentGame = gameRef.current
      const elapsed = timestamp - lastMoveAtRef.current
      const progress = reduceMotion ? 1 : Math.min(1, elapsed / getStepDuration(currentGame.score))
      const canvas = canvasRef.current
      if (canvas) drawBoard(canvas, currentGame, previousSnakeRef.current, progress, timestamp, metrics)
      if (animate && !reduceMotion) animationFrame = window.requestAnimationFrame(draw)
    }

    animationFrame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [animate, metrics, reduceMotion])

  useEffect(() => {
    if (animate && !reduceMotion) return

    const canvas = canvasRef.current
    if (canvas) drawBoard(canvas, game, previousSnakeRef.current, 1, performance.now(), metrics)
  }, [animate, game, metrics, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className="snake-board"
      width={metrics.size * metrics.pixelRatio}
      height={metrics.size * metrics.pixelRatio}
      aria-label="貪食蛇遊戲棋盤"
      role="img"
      tabIndex={0}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        const start = pointerStart.current
        pointerStart.current = null
        if (!start) return
        onSwipe(event.clientX - start.x, event.clientY - start.y)
      }}
    />
  )
}
