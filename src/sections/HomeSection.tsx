import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'

import { fadeUp, heroTransition, motionDuration, motionEase, staggerContainer } from '../animations/motion'
import { AmbientCanvas } from '../components/effects/AmbientCanvas'
import type { Profile } from '../types/site'
import type { Translation } from '../types/translation'
import { publicAsset } from '../utils/publicAsset'
import styles from './section.module.css'
import homeStyles from './HomeSection.module.css'

interface HomeSectionProps {
  profile: Profile
  copy: Translation['hero']
  sectionId: 'home' | 'about'
  theme: 'light' | 'dark'
}

export function HomeSection({ profile, copy, sectionId, theme }: HomeSectionProps) {
  const reduceMotion = useReducedMotion()
  const featuredProject = profile.projects.find((project) => project.id === 'zhuyin-correction-tool') ?? profile.projects[0]

  if (!featuredProject) return null

  const isExternalProject = featuredProject.kind === 'external'

  return (
    <section className={`${styles.section} ${homeStyles.home}`} id={sectionId} aria-labelledby="home-title">
      <div className={homeStyles.ambient} aria-hidden="true"><AmbientCanvas theme={theme} /></div>
      <motion.div
        className={homeStyles.copy}
        variants={staggerContainer}
        initial={reduceMotion ? false : 'hidden'}
        animate="visible"
      >
        <motion.p className={homeStyles.eyebrow} variants={fadeUp}>{copy.eyebrow}</motion.p>
        <motion.h1 id="home-title" variants={fadeUp}>{copy.title}</motion.h1>
        <motion.p className={homeStyles.tagline} variants={fadeUp}>{copy.description}</motion.p>
        <motion.div className={homeStyles.actions} variants={fadeUp}>
          <motion.a
            className={homeStyles.primaryAction}
            href="#projects"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: motionDuration.fast, ease: motionEase }}
          >
            {copy.primaryAction}
            <ArrowDown aria-hidden="true" size={18} strokeWidth={1.75} />
          </motion.a>
          <motion.a
            className={homeStyles.secondaryAction}
            href="#about"
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: motionDuration.fast, ease: motionEase }}
          >
            {copy.secondaryAction}
          </motion.a>
        </motion.div>
      </motion.div>
      <motion.div
        className={homeStyles.featured}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={heroTransition}
      >
        <p className={homeStyles.featuredLabel}>{copy.featuredLabel}</p>
        <a
          className={homeStyles.featuredCard}
          href={featuredProject.url}
          target={isExternalProject ? '_blank' : undefined}
          rel={isExternalProject ? 'noopener noreferrer' : undefined}
          aria-label={`${copy.featuredLabel}：${featuredProject.title}，${copy.featuredAction}`}
        >
          <div className={homeStyles.projectPreview}>
            <img
              src={publicAsset(featuredProject.image)}
              alt={featuredProject.imageAlt}
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className={homeStyles.projectDetails}>
            <span>{copy.featuredCategory}</span>
            <h2>{featuredProject.title}</h2>
            <p>{featuredProject.description}</p>
            <strong>
              {copy.featuredAction}
              <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
            </strong>
          </div>
        </a>
        <p className={homeStyles.disciplines}>{copy.disciplines}</p>
      </motion.div>
    </section>
  )
}
