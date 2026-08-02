import { describe, expect, it } from 'vitest'

import { profile } from './profile'

describe('profile data', () => {
  it('contains two external projects and one internal snake game', () => {
    expect(profile.projects).toHaveLength(3)

    const externalProjects = profile.projects.filter((project) => project.kind === 'external')
    expect(externalProjects).toHaveLength(2)
    for (const project of externalProjects) {
      expect(project.url).toMatch(/^https:\/\//)
      expect(project.image).toMatch(/^images\/projects\//)
      expect(project.imageAlt).not.toHaveLength(0)
    }

    expect(profile.projects.find((project) => project.id === 'neon-snake')).toMatchObject({
      kind: 'internal',
      url: '#/snake',
      actionLabel: '開始遊戲',
    })
  })
})
