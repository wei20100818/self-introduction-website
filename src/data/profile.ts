import type { Profile } from '../types/site'

export const profile = {
  name: '王宥崴',
  heroTagline: '對程式充滿熱情的高中生',
  contactEmail: 'wei20100818@gmail.com',
  avatar: 'images/profile/profile.png',
  navigation: [
    { id: 'home', href: '#home' },
    { id: 'about', href: '#about' },
    { id: 'projects', href: '#projects' },
    { id: 'contact', href: '#contact' },
  ],
  projects: [
    {
      id: 'guess-number',
      kind: 'external',
      title: '猜數字',
      description: '以 1 到 100 猜數字為核心，提供開始遊戲、不限次數猜測提示，以及使用本機記憶的個人紀錄入口。',
      url: 'https://wei20100818.github.io/-1-100/',
      image: 'images/projects/guess-number.png',
      imageAlt: '猜數字網站的首頁預覽',
    },
    {
      id: 'zhuyin-correction-tool',
      kind: 'external',
      title: '注音校正器',
      description: '透過 AI 偵測忘記切換輸入法產生的注音亂碼，並即時轉換為正確的繁體中文，減少重新輸入的麻煩。',
      url: 'https://chromewebstore.google.com/detail/%E6%B3%A8%E9%9F%B3%E6%A0%A1%E6%AD%A3%E5%99%A8-zhuyin-correction-t/ckcodgaecbnkdcadlhnofbdaeihbdklb?hl=zh-TW&utm_source=ext_sidebar',
      image: 'images/projects/zhuyin-correction-tool.png',
      imageAlt: '注音校正器的 Chrome 線上應用程式商店預覽',
    },
    {
      id: '2pick-simulator',
      kind: 'external',
      title: '多人連線卡牌對戰網頁遊戲',
      description: '以 2-Pick 選牌與卡牌對戰為主題的多人連線網頁作品，提供新連線、房號驗證、玩家暱稱與開始選牌入口。',
      url: 'https://2pick-try-1.shadowverse2pick.workers.dev/',
      image: 'images/projects/2pick-simulator.png',
      imageAlt: '2-Pick Simulator 的多人連線起始畫面預覽',
    },
    {
      id: 'neon-snake',
      kind: 'internal',
      title: '貪食蛇',
      description: '明亮霓虹風格的沉浸式貪食蛇遊戲，即將啟動。',
      url: '#/snake',
      actionLabel: '開始遊戲',
      image: 'images/projects/neon-snake-cover.png',
      imageAlt: '抽象霓虹蛇環繞透明遊戲面板',
    },
  ],
} as const satisfies Profile
