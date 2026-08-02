import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders the four required portfolio sections', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /把好奇心/ })).toBeInTheDocument()
    expect(document.getElementById('home')).toBeInTheDocument()
    expect(document.getElementById('about')).toBeInTheDocument()
    expect(document.getElementById('projects')).toBeInTheDocument()
    expect(document.getElementById('contact')).toBeInTheDocument()
  })

  it('keeps all project titles in Chinese', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 3, name: '猜數字' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '注音校正器' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: '多人連線卡牌對戰網頁遊戲' })).toBeInTheDocument()
  })
})
