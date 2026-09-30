import { useEffect, useRef, useState } from 'react'
import { normalize, type Language } from '../data'
import { Icon } from './Icon'
import { languageDisplayName, useI18n } from '../i18n'

export function LanguagePicker({languages, language, onChange}: {languages: Language[]; language: Language; onChange: (code: string) => void}) {
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = languages.filter(item => normalize(`${languageDisplayName(item.code, locale, item.name)} ${item.name} ${item.native} ${item.code} ${item.aliases?.join(' ')}`).includes(normalize(query))).sort((a,b) => languageDisplayName(a.code, locale, a.name).localeCompare(languageDisplayName(b.code, locale, b.name), locale))
  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {if (!root.current?.contains(event.target as Node)) setOpen(false)}
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  useEffect(() => { if (open) document.getElementById(`language-${items[active]?.code}`)?.scrollIntoView({block: 'nearest'}) }, [active, open, items])
  function choose(code: string, keyboard = false) {
    onChange(code)
    setOpen(false)
    if (keyboard) trigger.current?.focus()
  }
  return <div className="language-picker" ref={root} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)}}>
    <button ref={trigger} className="language-trigger" aria-expanded={open} aria-haspopup="listbox" aria-controls="language-options" onClick={() => {setOpen(!open); setQuery(''); setActive(0)}}>
      <span className="language-symbol" aria-hidden="true">文<span>A</span></span><span><small>{t('exploreLanguage')}</small><strong>{languageDisplayName(language.code, locale, language.name)}</strong></span><Icon name="chevron" size={18}/>
    </button>
    {open && <div className="language-menu">
      <div className="search-field"><Icon name="search" size={18}/><input autoFocus aria-label={t('searchLanguages')} role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="language-options" aria-activedescendant={items[active] ? `language-${items[active].code}` : undefined} placeholder={t('searchLanguagesPlaceholder', {count: languages.length})} value={query} onChange={e => {setQuery(e.target.value); setActive(0)}} onKeyDown={e => {
        if (e.key === 'ArrowDown') {e.preventDefault(); setActive(v => Math.min(v + 1, items.length - 1))}
        if (e.key === 'ArrowUp') {e.preventDefault(); setActive(v => Math.max(v - 1, 0))}
        if (e.key === 'Enter' && items[active]) {e.preventDefault(); choose(items[active].code, true)}
        if (e.key === 'Escape') {setOpen(false); trigger.current?.focus()}
      }}/></div>
      <div className="language-options" id="language-options" role="listbox" aria-label={t('searchLanguages')}>
        {items.map((item, index) => <div id={`language-${item.code}`} role="option" aria-selected={item.code === language.code} className={`language-option ${index === active ? 'active' : ''}`} key={item.code} onPointerDown={e => e.preventDefault()} onClick={() => choose(item.code)} onMouseMove={() => setActive(index)}><span>{languageDisplayName(item.code, locale, item.name)}<small>{item.native || item.code}</small></span>{item.code === language.code && <Icon name="check" size={17}/>}</div>)}
        {!items.length && <p className="empty">{t('noMatchingLanguages')}</p>}
      </div>
      <div className="menu-footer">{t('languagesCount', {count: languages.length})} · {t('unicodeCLDR')}</div>
    </div>}
  </div>
}
