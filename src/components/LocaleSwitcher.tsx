import { useI18n, type Locale } from '../i18n'

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="locale-switcher" role="group" aria-label="UI language">
      <button
        className={locale === 'en' ? 'active' : ''}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <span className="locale-divider" aria-hidden="true">|</span>
      <button
        className={locale === 'ru' ? 'active' : ''}
        onClick={() => setLocale('ru')}
        aria-pressed={locale === 'ru'}
      >
        RU
      </button>
    </div>
  )
}
