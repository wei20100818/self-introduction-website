import { motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'

import { motionDuration, motionEase } from './animations/motion'
import { PageLoader } from './components/common/PageLoader'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { profile } from './data/profile'
import { useActiveSection } from './hooks/useActiveSection'
import { useSnakeRoute } from './hooks/useSnakeRoute'
import { useStoredPreference } from './hooks/useStoredPreference'
import { DEFAULT_LOCALE, translations } from './i18n/translations'
import { AboutSection } from './sections/AboutSection'
import { ContactSection } from './sections/ContactSection'
import { HomeSection } from './sections/HomeSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SupportSection } from './sections/SupportSection'
import { SnakeGamePage } from './pages/SnakeGamePage'
import type { Locale } from './types/translation'
import styles from './App.module.css'

const navigationIds = profile.navigation.map((item) => item.id)

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'

  const documentTheme = document.documentElement.dataset.theme
  if (documentTheme === 'light' || documentTheme === 'dark') return documentTheme

  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [locale, setLocale] = useStoredPreference<Locale>('portfolio-locale', DEFAULT_LOCALE, ['zh-TW', 'en'])
  const [theme, setTheme] = useStoredPreference<'light' | 'dark'>('portfolio-theme', getInitialTheme(), ['light', 'dark'])
  const copy = translations[locale]
  const activeSection = useActiveSection(navigationIds)
  const reduceMotion = useReducedMotion()
  const snakeRouteActive = useSnakeRoute()

  useEffect(() => {
    const effectiveTheme = snakeRouteActive ? 'light' : theme
    document.documentElement.dataset.theme = effectiveTheme
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = effectiveTheme === 'dark' ? '#09121a' : '#f5f9fc'
  }, [snakeRouteActive, theme])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant' : 'en'
  }, [locale])

  if (snakeRouteActive) {
    return <SnakeGamePage />
  }

  return (
    <div className={styles.siteShell}>
      <a className="skip-link" href="#main-content">
        {copy.common.skipToContent}
      </a>
      <PageLoader />
      <SiteHeader
        activeSection={activeSection}
        brand={profile.name}
        copy={copy}
        locale={locale}
        navigation={profile.navigation}
        onLocaleToggle={() => setLocale(locale === 'zh-TW' ? 'en' : 'zh-TW')}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        theme={theme}
      />
      <motion.main
        className={styles.main}
        id="main-content"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDuration.normal, ease: motionEase }}
      >
        <HomeSection profile={profile} copy={copy.hero} sectionId="home" theme={theme} />
        <AboutSection copy={copy.about} sectionId="about" />
        <ProjectsSection copy={copy.projects} commonCopy={copy.common} />
        <SupportSection locale={locale} />
        <ContactSection copy={copy.contact} validationCopy={copy.validation} recipient={profile.contactEmail} />
      </motion.main>
      <SiteFooter name={profile.name} copy={copy.footer} />
    </div>
  )
}

export default App
