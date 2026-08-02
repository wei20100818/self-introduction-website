import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'
import { profile } from './data/profile'

describe('portfolio interactions', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState(null, '', window.location.pathname)
    document.documentElement.dataset.theme = 'light'
    document.documentElement.lang = 'zh-Hant'
  })

  it('defaults to Chinese and keeps project titles Chinese after switching to English', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('link', { name: '首頁' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('zh-Hant')

    await user.click(screen.getByRole('button', { name: 'Switch to English' }))

    expect(document.documentElement.lang).toBe('en')
    expect(window.localStorage.getItem('portfolio-locale')).toBe('en')
    for (const project of profile.projects) {
      expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument()
    }
  })

  it('updates the theme preference and exposes useful navigation controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '切換為深色模式' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('portfolio-theme')).toBe('dark')
    expect(screen.getByRole('link', { name: '查看精選作品' })).toHaveAttribute('href', '#projects')
    expect(screen.getAllByRole('link', { name: '關於我' }).at(-1)).toHaveAttribute('href', '#about')

    const menuButton = document.querySelector<HTMLButtonElement>('[aria-controls="mobile-navigation"]')
    expect(menuButton).not.toBeNull()
    if (!menuButton) throw new Error('The mobile navigation control is missing.')

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens the snake game as an internal, immersive hash route', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const project of profile.projects.filter((item) => item.kind === 'external')) {
      const link = screen.getAllByRole('link', { name: new RegExp(project.title) }).at(-1)
      expect(link).toBeDefined()
      if (!link) throw new Error(`The ${project.title} project link is missing.`)
      expect(link).toHaveAttribute('href', project.url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }

    const snakeLink = screen.getByRole('link', { name: /貪食蛇/ })
    expect(snakeLink).toHaveAttribute('href', '#/snake')
    expect(snakeLink).not.toHaveAttribute('target')

    await user.click(snakeLink)

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: '貪食蛇' })).toBeInTheDocument())
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
