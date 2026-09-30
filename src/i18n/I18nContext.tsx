import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Locale, interpolate } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof typeof translations.en, values?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

function getStoredLocale(): Locale {
  const stored = localStorage.getItem('lingua-locale')
  if (stored === 'en' || stored === 'ru') return stored
  
  // Detect browser language
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ru')) return 'ru'
  
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('lingua-locale', newLocale)
    document.documentElement.lang = newLocale
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: keyof typeof translations.en, values?: Record<string, string | number>) => {
    const template = translations[locale][key]
    return values ? interpolate(template, values) : template
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
