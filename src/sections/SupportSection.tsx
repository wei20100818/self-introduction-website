import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState, type FormEvent } from 'react'

import { fadeUp, sectionViewport } from '../animations/motion'
import type { Locale } from '../types/translation'
import styles from './section.module.css'
import supportStyles from './SupportSection.module.css'

const presetAmounts = [50, 100, 300]
const minimumAmount = 10

interface SupportSectionProps {
  locale: Locale
}

export function SupportSection({ locale }: SupportSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [error, setError] = useState('')
  const reduceMotion = useReducedMotion()
  const apiOrigin = import.meta.env.VITE_PAYMENT_API_ORIGIN?.replace(/\/$/, '')
  const isEnglish = locale === 'en'
  const amount = selectedAmount === 'custom' ? Number(customAmount) : selectedAmount
  const donationState = useMemo(() => new URLSearchParams(window.location.search).get('donation'), [])

  const copy = isEnglish
    ? {
        eyebrow: 'SUPPORT',
        title: 'Support my ongoing creations.',
        description: 'If something here was useful or inspiring, your support helps me keep making and learning.',
        custom: 'Custom amount',
        minimum: 'Minimum NT$10',
        submit: 'Support my creations',
        setup: 'Donations are being set up. Please come back soon.',
        invalid: 'Please enter a whole-number amount of at least NT$10.',
        success: 'Thank you for your support!',
        failed: 'The payment was not completed. You can try again whenever you are ready.',
      }
    : {
        eyebrow: 'SUPPORT',
        title: '贊助我持續創作',
        description: '如果這裡的作品對你有幫助或帶來靈感，你的支持能讓我繼續創作與學習。',
        custom: '自訂金額',
        minimum: '最低 NT$10',
        submit: '贊助我持續創作',
        setup: '贊助功能正在準備中，請稍後再回來。',
        invalid: '請輸入至少 NT$10 的整數金額。',
        success: '謝謝你的贊助！',
        failed: '付款尚未完成；準備好後，隨時可以再試一次。',
      }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!apiOrigin) {
      event.preventDefault()
      setError(copy.setup)
      return
    }

    if (!Number.isSafeInteger(amount) || amount < minimumAmount) {
      event.preventDefault()
      setError(copy.invalid)
      return
    }

    setError('')
  }

  return (
    <section className={styles.section} id="support" aria-labelledby="support-title">
      <motion.div
        className={supportStyles.card}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={sectionViewport}
        variants={fadeUp}
      >
        <p className={supportStyles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="support-title">{copy.title}</h2>
        <p className={supportStyles.description}>{copy.description}</p>
        {donationState === 'success' ? <p className={supportStyles.success} role="status">{copy.success}</p> : null}
        {donationState === 'failed' ? <p className={supportStyles.error} role="alert">{copy.failed}</p> : null}
        <form action={apiOrigin ? `${apiOrigin}/api/create-payment` : undefined} method="post" onSubmit={handleSubmit}>
          <fieldset className={supportStyles.amounts}>
            <legend>{isEnglish ? 'Choose an amount' : '選擇贊助金額'}</legend>
            <div className={supportStyles.amountButtons}>
              {presetAmounts.map((preset) => (
                <button
                  aria-pressed={selectedAmount === preset}
                  className={selectedAmount === preset ? supportStyles.selected : undefined}
                  key={preset}
                  onClick={() => { setSelectedAmount(preset); setError('') }}
                  type="button"
                >
                  NT${preset}
                </button>
              ))}
              <button
                aria-pressed={selectedAmount === 'custom'}
                className={selectedAmount === 'custom' ? supportStyles.selected : undefined}
                onClick={() => { setSelectedAmount('custom'); setError('') }}
                type="button"
              >
                {copy.custom}
              </button>
            </div>
            {selectedAmount === 'custom' ? (
              <label className={supportStyles.customAmount}>
                <span>{copy.custom}</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  min={minimumAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  placeholder="NT$"
                  required
                  step="1"
                  type="number"
                  value={customAmount}
                />
              </label>
            ) : null}
            <input name="amount" type="hidden" value={Number.isSafeInteger(amount) ? amount : ''} />
            <p className={supportStyles.minimum}>{copy.minimum}</p>
          </fieldset>
          <button className={supportStyles.submit} type="submit">{copy.submit}</button>
          {error ? <p className={supportStyles.error} role="alert">{error}</p> : null}
        </form>
      </motion.div>
    </section>
  )
}
