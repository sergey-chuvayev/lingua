import { useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { compact, normalize, number, percent, type Boundaries, type Dataset, type Metric } from './data'
import { LanguagePicker } from './components/LanguagePicker'
import { WorldMap } from './components/WorldMap'
import { Icon } from './components/Icon'

export function App() {
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
      if (!response.ok) throw new Error('The atlas data could not be loaded.')
      return response.json()
    })).then(([data, boundaries]) => setLoaded({data, boundaries})).catch(e => {if (e.name !== 'AbortError') setError('The atlas data could not be loaded. Check your connection and try again.')})
    return () => controller.abort()
  }, [attempt])
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
    <a className="skip-link" href="#explore">Skip to atlas</a>
    <header className="site-header"><a href={import.meta.env.BASE_URL} className="brand" aria-label="Lingua home"><Icon name="globe" size={28}/><span>lingua<span className="brand-period">.</span></span></a><span className="brand-description">THE LANGUAGE ATLAS</span><button className="about-link" onClick={openMethodology}>About the data <Icon name="arrow" size={16}/></button></header>
    <main>
      <section className="intro"><div><div className="eyebrow"><span/>MANY VOICES. ONE WORLD.</div><h1>A world of <em>languages.</em></h1><p>Discover where languages live, one country at a time.</p></div><div className="intro-note"><Icon name="globe" size={18}/><span>Explore the connections<br/>that cross our borders.</span></div></section>
      {!loaded || !language || !data ? <section className="loading-state" role={error ? 'alert' : 'status'}><Icon name="globe" size={44}/><h2>{error ? 'The atlas needs a moment.' : 'Opening the atlas…'}</h2><p>{error || 'Loading countries and language estimates.'}</p>{error && <button className="text-button" onClick={() => setAttempt(v=>v+1)}>Try again <Icon name="arrow"/></button>}</section> : <>
        <section className="explorer-toolbar" id="explore" aria-label="Map settings"><LanguagePicker languages={data.languages} language={language} onChange={chooseLanguage}/><div className="popular-languages"><span>Try</span>{['en','es','ar','zh'].map(code => <button key={code} className={language.code === code ? 'selected' : ''} onClick={()=>chooseLanguage(code)}>{data.languages.find(l=>l.code===code)?.name}</button>)}</div><div className="metric-control" role="group" aria-label="Color map by"><button aria-pressed={metric === 'speakers'} onClick={()=>setMetric('speakers')}>Speaker count</button><button aria-pressed={metric === 'percent'} onClick={()=>setMetric('percent')}>Population %</button></div></section>
        <div className="atlas-layout"><WorldMap boundaries={loaded.boundaries} data={data} language={language} metric={metric} selected={selected} onSelect={setSelected}/>
          <aside className="country-panel" aria-label="Country statistics"><div className="panel-heading"><div><span className="eyebrow">THE BIGGER PICTURE</span><h2>{language.name}<span>{language.native}</span></h2></div><span className="language-code">{language.code.replace('_','-').toUpperCase()}</span></div>
            <div className="summary" aria-live="polite"><div><strong>≈ {compact(total)}</strong><span>speakers in reported territories</span></div><div><strong>{Object.keys(language.records).length}</strong><span>countries & territories with data</span></div></div>
            {language.note && <p className="language-note"><Icon name="info" size={16}/>{language.note}</p>}
            {country && <section className="country-detail" aria-label="Selected country"><div className="detail-heading"><span className="eyebrow">COUNTRY SPOTLIGHT</span><button className="icon-button" aria-label="Close country details" onClick={()=>setSelected(null)}><Icon name="close" size={16}/></button></div><h3>{country.name}</h3>{record ? <><div className="detail-count">≈ {number(record.speakers)}<span>{language.name} speakers</span></div><dl><div><dt>Share of population</dt><dd>{percent(record.percent)}</dd></div><div><dt>Source population</dt><dd>{country.population === null ? 'Unavailable' : number(country.population)}</dd></div></dl>{record.speakers === 0 && <p>CLDR reports 0%; this may reflect rounding, not an absence of speakers.</p>}</> : <p>No estimate for {language.name} in this country. Missing data does not mean there are no speakers.</p>}{language.code === 'es' && selected === 'PH' && <p>Source caution: CLDR reports 31% for Spanish here. This figure has not been independently validated.</p>}<p className="detail-source">Unicode CLDR 48.2 · Mixed reference years<br/>First- and later-language speakers where available.</p>{!country.mapped && <p className="detail-source">This territory has no separate polygon at this map scale.</p>}</section>}
            <div className="ranking-heading"><h3>{showAll ? 'All countries & territories' : 'Where it’s spoken'}</h3><span>{metric === 'speakers' ? 'SPEAKERS' : 'SHARE'}</span></div>
            <div className="country-search search-field"><Icon name="search" size={16}/><input aria-label="Find a country" placeholder="Find a country…" value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button className="icon-button" aria-label="Clear country search" onClick={()=>setQuery('')}><Icon name="close" size={14}/></button>}</div>
            <div className={`country-list ${showAll || query ? 'expanded' : ''}`}><ol>{visible.map((row, index) => <li key={row.code}><button aria-pressed={selected === row.code} onClick={()=>setSelected(row.code)}><span className="rank">{query ? '·' : String(index + 1).padStart(2,'0')}</span><span className="country-name">{row.name}{row.record && <span className="country-bar" style={{width:`${Math.max(1, row.record[metric] / Math.max(1, ranking[0]?.record?.[metric] ?? 1) * 100)}%`}}/>}</span><span className="country-value">{row.record ? metric === 'speakers' ? compact(row.record.speakers) : percent(row.record.percent) : 'No estimate'}</span></button></li>)}</ol>{!visible.length && <p className="empty">No countries match “{query}”.</p>}</div>
            <button className="view-all" onClick={()=>setShowAll(!showAll)}>{showAll ? 'Show top countries' : `Explore all ${ranking.length} countries & territories`}<Icon name={showAll ? 'chevron' : 'arrow'} size={16}/></button>
          </aside></div>
        <div className="atlas-footnote"><span><Icon name="info" size={16}/>Estimates, not a census. Missing data never means zero speakers.</span><button onClick={openMethodology}>How to read this map <Icon name="arrow" size={15}/></button></div>
        <section id="methodology" className="methodology"><button className="methodology-toggle" aria-expanded={methodology} onClick={()=>setMethodology(!methodology)}><span><span className="eyebrow">BEHIND THE NUMBERS</span><span className="methodology-title">An atlas with an open book.</span></span><span className="methodology-toggle-right">Sources & limitations <Icon name={methodology ? 'close' : 'chevron'} size={18}/></span></button>{methodology && <div className="methodology-content"><div><h3>Real data. Approximate counts.</h3><p>Counts are calculated from Unicode CLDR 48.2’s territory population × language population percentage, rounded to a person. They include first- and later-language speakers where available; the source does not provide a consistent native-speaker split.</p><a href={data.sourceUrl} target="_blank" rel="noreferrer">Read the CLDR source table ↗</a></div><div><h3>Coverage has edges.</h3><p>Source records combine different reference years and methods. Small and diaspora populations are often missing. Totals cover reported territories only, and are not complete global totals. Script variants are kept separate to avoid double-counting.</p><p>CLDR is intended for localization, not demographic research. Notable source values, such as Spanish at 31% in the Philippines, are retained without independent validation.</p><p>Boundaries: Natural Earth 1:50m, v5.1.2. Some small territories are available only in the list. Borders are for visualization, not a statement of sovereignty.</p></div><div><h3>A scale you can compare.</h3><p>Speaker counts use fixed logarithmic bins so smaller communities remain visible. Population share uses fixed percentage bins. Gray means no estimate; ivory means an explicit zero in the source, which may be rounded.</p><a href="data/languages.json" download>Download the bundled dataset ↓</a></div></div>}</section>
      </>}
    </main>
    <footer className="site-footer"><span>Every language is a different way of seeing the world.</span><div><span className={`offline-status ${offlineReady ? 'ready' : ''}`}><i/>{offlineReady ? 'Ready for offline exploration' : 'Bundled data · no map tiles'}</span><span>Made for the curious.</span></div></footer>
  </>
}
