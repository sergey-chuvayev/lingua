import type { Locale } from './translations'

const displayNames = new Map<Locale, Intl.DisplayNames>()

export function languageDisplayName(code: string, locale: Locale, fallback = code): string {
  const tag = code.replaceAll('_', '-')
  try {
    let names = displayNames.get(locale)
    if (!names) {
      names = new Intl.DisplayNames([locale], { type: 'language', fallback: 'none' })
      displayNames.set(locale, names)
    }
    const name = names.of(tag)
    return name && name !== tag ? name : fallback
  } catch {
    return fallback
  }
}
