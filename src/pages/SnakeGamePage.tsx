import { useEffect, useState } from 'react'

import { SnakeBoard } from '../games/snake/SnakeBoard'
import { DIRECTIONS, formatDuration } from '../games/snake/engine'
import { useSnakeGame } from '../games/snake/useSnakeGame'
import styles from './SnakeGamePage.module.css'

export function SnakeGamePage() {
  const { changeDirection, game, highScore, returnToIntro, startGame, status, togglePause } = useSnakeGame()
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (!game.energyFood?.expiresAt || status !== 'running') return

    const interval = window.setInterval(() => setCurrentTime(Date.now()), 100)
    const initialUpdate = window.setTimeout(() => setCurrentTime(Date.now()), 0)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(initialUpdate)
    }
  }, [game.energyFood?.expiresAt, status])

  const energySeconds = game.energyFood?.expiresAt
    ? Math.min(8, Math.max(0, Math.ceil((game.energyFood.expiresAt - currentTime) / 1_000)))
    : null

  const handleSwipe = (deltaX: number, deltaY: number) => {
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      changeDirection(deltaX > 0 ? DIRECTIONS.right : DIRECTIONS.left)
      return
    }
    changeDirection(deltaY > 0 ? DIRECTIONS.down : DIRECTIONS.up)
  }

  return (
    <main className={styles.page} aria-labelledby="snake-game-title">
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.scanline} aria-hidden="true" />
      <section className={styles.gameShell}>
        <header className={styles.hud}>
          <div>
            <p className={styles.eyebrow}>NEON GRID / 01</p>
            <h1 id="snake-game-title">貪食蛇</h1>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>分數</dt>
              <dd>{game.score}</dd>
            </div>
            <div>
              <dt>最高分</dt>
              <dd>{highScore}</dd>
            </div>
            <div>
              <dt>時間</dt>
              <dd>{formatDuration(game.elapsedMs)}</dd>
            </div>
          </dl>
        </header>

        <div className={`${styles.energyStatus} ${energySeconds === null ? '' : styles.energyStatusActive}`} aria-live="polite">
          <span className={styles.energyDot} aria-hidden="true" />
          {energySeconds === null ? '能量核心：待偵測' : `能量核心：${String(energySeconds).padStart(2, '0')} 秒`}
        </div>

        <div className={styles.boardFrame}>
          <SnakeBoard animate={status === 'running'} game={game} onSwipe={handleSwipe} />

          {status === 'intro' && (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <p className={styles.eyebrow}>READY / 01</p>
                <h2>準備開始</h2>
                <ul className={styles.rules}>
                  <li>使用 W、A、S、D 控制方向</li>
                  <li>碰到牆壁或自己即結束</li>
                  <li>紫色能量核心限時 8 秒，吃到加 3 分</li>
                </ul>
                <button className={styles.primaryButton} type="button" onClick={startGame}>
                  開始遊戲
                </button>
              </div>
            </div>
          )}

          {status === 'paused' && (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <p className={styles.eyebrow}>PAUSED</p>
                <h2>已暫停</h2>
                <p>按 Space 繼續遊戲</p>
                <button className={styles.primaryButton} type="button" onClick={togglePause}>
                  繼續遊戲
                </button>
              </div>
            </div>
          )}

          {status === 'game-over' && (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <p className={styles.eyebrow}>RUN COMPLETE</p>
                <h2>遊戲結束</h2>
                <dl className={styles.summary}>
                  <div><dt>本局分數</dt><dd>{game.score}</dd></div>
                  <div><dt>本局時間</dt><dd>{formatDuration(game.elapsedMs)}</dd></div>
                  <div><dt>吃到食物</dt><dd>{game.foodEaten}</dd></div>
                  <div><dt>最高分</dt><dd>{highScore}</dd></div>
                </dl>
                <button className={styles.primaryButton} type="button" onClick={returnToIntro}>
                  返回
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.controlsRow}>
          <p>桌機使用 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移動，<kbd>Space</kbd> 暫停</p>
          <button className={styles.pauseButton} type="button" onClick={togglePause} disabled={status !== 'running'}>
            暫停
          </button>
        </div>

        <div className={styles.mobileControls} aria-label="觸控方向控制">
          <button type="button" aria-label="向上" onClick={() => changeDirection(DIRECTIONS.up)}>↑</button>
          <button type="button" aria-label="向左" onClick={() => changeDirection(DIRECTIONS.left)}>←</button>
          <button type="button" aria-label="向下" onClick={() => changeDirection(DIRECTIONS.down)}>↓</button>
          <button type="button" aria-label="向右" onClick={() => changeDirection(DIRECTIONS.right)}>→</button>
        </div>
      </section>
      <aside className={styles.rotateNotice} aria-label="請旋轉裝置">
        <span aria-hidden="true">↻</span>
        <strong>請旋轉裝置</strong>
        <p>橫向遊玩能獲得最佳的霓虹棋盤體驗。</p>
      </aside>
    </main>
  )
}
