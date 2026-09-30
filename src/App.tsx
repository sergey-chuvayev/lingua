import { useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { compact, normalize, number, percent, type Boundaries, type Dataset, type Metric } from './data'
import { LanguagePicker } from './components/LanguagePicker'
import { WorldMap } from './components/WorldMap'
import { Icon } from './components/Icon'
import { LocaleSwitcher } from './components/LocaleSwitcher'
import { useI18n } from './i18n'

export function App() {
  const { t } = useI18n()
  const [loaded, setLoaded] = useState<{data: Dataset; boundaries: Boundaries} | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [languageCode, setLanguageCode] = useState(() => new URLSearchParams(location.search).get('lang') || 'fr')
  const [metric, setMetric] = useState<Metric>('speakers')
  const [selected, setSelected] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [methodology, setMethodology] = useState(false)
  const {offlineReady: [offlineReady, setOfflineReady]} = useRegisterSW()
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    let mounted = true
    navigator.serviceWorker.ready.then(() => {if (mounted) setOfflineReady(true)})
    return () => {mounted = false}
  }, [setOfflineReady])
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    Promise.all(['languages.json', 'countries.geojson'].map(async file => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`, {signal: controller.signal})
      if (!response.ok) throw new Error(t('errorMessage'))
      return response.json()
    })).then(([data, boundaries]) => setLoaded({data, boundaries})).catch(e => {if (e.name !== 'AbortError') setError(t('errorMessage'))})
    return () => controller.abort()
  }, [attempt, t])
  const data = loaded?.data
  const language = data?.languages.find(l => l.code === languageCode) ?? data?.languages.find(l => l.code === 'fr')
  const ranking = useMemo(() => {
    if (!data || !language) return []
    return Object.entries(data.countries).map(([code, country]) => ({code, ...country, record: language.records[code]})).sort((a,b) => (b.record?.[metric] ?? -1) - (a.record?.[metric] ?? -1) || a.name.localeCompare(b.name))
  }, [data, language, metric])
  function chooseLanguage(code: string) {
    setLanguageCode(code)
    const url = new URL(location.href); url.searchParams.set('lang', code); history.replaceState(null, '', url)
  }
  function openMethodology() {setMethodology(true); requestAnimationFrame(() => document.getElementById('methodology')?.scrollIntoView({behavior:'smooth', block:'start'}))}
  const country = selected && data ? data.countries[selected] : null
  const record = selected ? language?.records[selected] : undefined
  const total = language ? Object.values(language.records).reduce((sum, row) => sum + row.speakers, 0) : 0
  const filtered = ranking.filter(row => (!query || normalize(row.name).includes(normalize(query))) && (showAll || query || row.record))
  const visible = showAll || query ? filtered : filtered.slice(0, 7)
  return <>
    <a className="skip-link" href="#explore">{t('skipToAtlas')}</a>
    <header className="site-header"><a href={import.meta.env.BASE_URL} className="brand" aria-label="Lingua home"><Icon name="globe" size={28}/><span>{t('brandTitle')}<span className="brand-period">.</span></span></a><span className="brand-description">{t('brandDescription')}</span><LocaleSwitcher /><button className="about-link" onClick={openMethodology}>{t('aboutData')} <Icon name="arrow" size={16}/></button></header>
    <main>
      <section className="intro"><div><div className="eyebrow"><span/>{t('eyebrow')}</div><h1 dangerouslySetInnerHTML={{__html: t('heroTitle')}} /><p>{t('heroSubtitle')}</p></div><div className="intro-note"><Icon name="globe" size={18}/><span dangerouslySetInnerHTML={{__html: t('introNote')}} /></div></section>
      {!loaded || !language || !data ? <section className="loading-state" role={error ? 'alert' : 'status'}><Icon name="globe" size={44}/><h2>{error ? t('errorTitle') : t('loadingTitle')}</h2><p>{error || t('loadingMessage')}</p>{error && <button className="text-button" onClick={() => setAttempt(v=>v+1)}>{t('tryAgain')} <Icon name="arrow"/></button>}</section> : <>
        <section className="explorer-toolbar" id="explore" aria-label={t('exploreLabel')}><LanguagePicker languages={data.languages} language={language} onChange={chooseLanguage}/><div className="popular-languages"><span>{t('popularLanguagesTry')}</span>{['en','es','ar','zh'].map(code => <button key={code} className={language.code === code ? 'selected' : ''} onClick={()=>chooseLanguage(code)}>{data.languages.find(l=>l.code===code)?.name}</button>)}</div><div className="metric-control" role="group" aria-label={t('metricLabel')}><button aria-pressed={metric === 'speakers'} onClick={()=>setMetric('speakers')}>{t('speakerCount')}</button><button aria-pressed={metric === 'percent'} onClick={()=>setMetric('percent')}>{t('populationPercent')}</button></div></section>
        <div className="atlas-layout"><WorldMap boundaries={loaded.boundaries} data={data} language={language} metric={metric} selected={selected} onSelect={setSelected}/>
          <aside className="country-panel" aria-label="Country statistics"><div className="panel-heading"><div><span className="eyebrow">{t('theBiggerPicture')}</span><h2>{language.name}<span>{language.native}</span></h2></div><span className="language-code">{language.code.replace('_','-').toUpperCase()}</span></div>
            <div className="summary" aria-live="polite"><div><strong>≈ {compact(total)}</strong><span>{t('speakersInTerritories')}</span></div><div><strong>{Object.keys(language.records).length}</strong><span>{t('countriesWithData')}</span></div></div>
            {language.note && <p className="language-note"><Icon name="info" size={16}/>{language.note}</p>}
            {country && <section className="country-detail" aria-label={t('countrySpotlight')}><div className="detail-heading"><span className="eyebrow">{t('countrySpotlight')}</span><button className="icon-button" aria-label={t('closeCountryDetails')} onClick={()=>setSelected(null)}><Icon name="close" size={16}/></button></div><h3>{country.name}</h3>{record ? <><div className="detail-count">≈ {number(record.speakers)}<span>{t('speakers', {language: language.name})}</span></div><dl><div><dt>{t('shareOfPopulation')}</dt><dd>{percent(record.percent)}</dd></div><div><dt>{t('sourcePopulation')}</dt><dd>{country.population === null ? t('unavailable') : number(country.population)}</dd></div></dl>{record.speakers === 0 && <p>{t('zeroPercent')}</p>}</> : <p>{t('noEstimate', {language: language.name})}</p>}{language.code === 'es' && selected === 'PH' && <p>{t('sourceCautionES')}</p>}<p className="detail-source" dangerouslySetInnerHTML={{__html: t('detailSource')}} />{!country.mapped && <p className="detail-source">{t('noPolygon')}</p>}</section>}
            <div className="ranking-heading"><h3>{showAll ? t('allCountries') : t('whereSpoken')}</h3><span>{metric === 'speakers' ? t('rankingSpeakers') : t('rankingShare')}</span></div>
            <div className="country-search search-field"><Icon name="search" size={16}/><input aria-label={t('findCountry')} placeholder={t('findCountryPlaceholder')} value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button className="icon-button" aria-label={t('clearCountrySearch')} onClick={()=>setQuery('')}><Icon name="close" size={14}/></button>}</div>
            <div className={`country-list ${showAll || query ? 'expanded' : ''}`}><ol>{visible.map((row, index) => <li key={row.code}><button aria-pressed={selected === row.code} onClick={()=>setSelected(row.code)}><span className="rank">{query ? '·' : String(index + 1).padStart(2,'0')}</span><span className="country-name">{row.name}{row.record && <span className="country-bar" style={{width:`${Math.max(1, row.record[metric] / Math.max(1, ranking[0]?.record?.[metric] ?? 1) * 100)}%`}}/>}</span><span className="country-value">{row.record ? metric === 'speakers' ? compact(row.record.speakers) : percent(row.record.percent) : t('noDataEstimate')}</span></button></li>)}</ol>{!visible.length && <p className="empty">{t('noCountriesMatch', {query})}</p>}</div>
            <button className="view-all" onClick={()=>setShowAll(!showAll)}>{showAll ? t('showTopCountries') : t('exploreAllCountries', {count: ranking.length})}<Icon name={showAll ? 'chevron' : 'arrow'} size={16}/></button>
          </aside></div>
        <div className="atlas-footnote"><span><Icon name="info" size={16}/>{t('footnoteEstimates')}</span><button onClick={openMethodology}>{t('howToRead')} <Icon name="arrow" size={15}/></button></div>
        <section id="methodology" className="methodology"><button className="methodology-toggle" aria-expanded={methodology} onClick={()=>setMethodology(!methodology)}><span><span className="eyebrow">{t('methodologyEyebrow')}</span><span className="methodology-title">{t('methodologyTitle')}</span></span><span className="methodology-toggle-right">{t('methodologyToggle')} <Icon name={methodology ? 'close' : 'chevron'} size={18}/></span></button>{methodology && <div className="methodology-content"><div><h3>{t('methodologyRealDataTitle')}</h3><p>{t('methodologyRealDataText')}</p><a href={data.sourceUrl} target="_blank" rel="noreferrer">{t('methodologyReadSource')}</a></div><div><h3>{t('methodologyCoverageTitle')}</h3><p>{t('methodologyCoverageText1')}</p><p>{t('methodologyCoverageText2')}</p><p>{t('methodologyCoverageText3')}</p></div><div><h3>{t('methodologyScaleTitle')}</h3><p>{t('methodologyScaleText')}</p><a href="data/languages.json" download>{t('methodologyDownload')}</a></div></div>}</section>
      </>}
    </main>
    <footer className="site-footer"><span>{t('footerQuote')}</span><div><span className={`offline-status ${offlineReady ? 'ready' : ''}`}><i/>{offlineReady ? t('offlineReady') : t('offlineNotReady')}</span><span>{t('madeFor')}</span></div></footer>
  </>
}
