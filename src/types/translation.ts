import type { NavigationId } from './site'

export type Locale = 'zh-TW' | 'en'

export interface Translation {
  common: {
    skipToContent: string
    browseWebsite: string
    openMenu: string
    closeMenu: string
    switchToLight: string
    switchToDark: string
    switchToEnglish: string
    switchToChinese: string
  }
  navigation: Record<NavigationId, string>
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryAction: string
    secondaryAction: string
    featuredLabel: string
    featuredCategory: string
    featuredAction: string
    disciplines: string
  }
  about: {
    eyebrow: string
    title: string
    body: string
  }
  projects: {
    eyebrow: string
    title: string
    description: string
    previewLabel: string
  }
  contact: {
    eyebrow: string
    title: string
    description: string
    nameLabel: string
    emailLabel: string
    messageLabel: string
    namePlaceholder: string
    emailPlaceholder: string
    messagePlaceholder: string
    submit: string
    openingMail: string
    mailClientHelp: string
  }
  footer: {
    backToTop: string
    copyright: string
  }
  validation: {
    required: string
    nameTooShort: string
    nameTooLong: string
    invalidEmail: string
    messageTooShort: string
    messageTooLong: string
  }
}
