interface ProjectBase {
  id: 'guess-number' | 'zhuyin-correction-tool' | '2pick-simulator' | 'neon-snake'
  title: string
  description: string
  image: string
  imageAlt: string
}

export interface ExternalProject extends ProjectBase {
  kind: 'external'
  url: `https://${string}`
}

export interface InternalProject extends ProjectBase {
  kind: 'internal'
  url: '#/snake'
  actionLabel: '開始遊戲'
}

export type Project = ExternalProject | InternalProject
