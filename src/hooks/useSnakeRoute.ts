import { useEffect, useState } from 'react'

const SNAKE_ROUTE = '#/snake'

function isSnakeRoute(hash: string): boolean {
  return hash === SNAKE_ROUTE
}

export function useSnakeRoute(): boolean {
  const [snakeRouteActive, setSnakeRouteActive] = useState(() => isSnakeRoute(window.location.hash))

  useEffect(() => {
    const updateRoute = () => setSnakeRouteActive(isSnakeRoute(window.location.hash))

    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  return snakeRouteActive
}
