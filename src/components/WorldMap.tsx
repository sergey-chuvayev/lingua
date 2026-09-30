import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { colorFor, compact, percent, COLORS, LABELS, NO_DATA, ZERO_COLOR, type Boundaries, type Dataset, type Language, type Metric } from '../data'
import { languageDisplayName, useI18n } from '../i18n'
import { Icon } from './Icon'
const WORLD: L.LatLngBoundsExpression = [[-57, -179], [80, 179]]
export function WorldMap({boundaries, data, language, metric, selected, onSelect}: {boundaries: Boundaries; data: Dataset; language: Language; metric: Metric; selected: string | null; onSelect: (code: string) => void}) {
  const { t, locale } = useI18n()
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.GeoJSON | null>(null)
  const live = useRef({language, metric, selected, onSelect, locale, t})
  live.current = {language, metric, selected, onSelect, locale, t}
  useEffect(() => {
    if (!container.current) return
    const atlas = L.map(container.current, {crs: L.CRS.EPSG4326, zoomControl: false, attributionControl: false, scrollWheelZoom: false, zoomSnap: 0.25, zoomDelta: 0.5, minZoom: -2, maxZoom: 6, maxBounds: [[-90, -220], [90, 220]], maxBoundsViscosity: 0.7})
    map.current = atlas
    for (let lat = -60; lat <= 80; lat += 20) L.polyline([[lat,-180],[lat,180]], {color:'#cbd5ce', weight:0.6, opacity:0.5, interactive:false}).addTo(atlas)
    for (let lon = -180; lon <= 180; lon += 30) L.polyline([[-80,lon],[85,lon]], {color:'#cbd5ce', weight:0.6, opacity:0.5, interactive:false}).addTo(atlas)
    for (const [lat, lon, label] of [[0, -140, 'PACIFIC'], [0, -27, 'ATLANTIC'], [-28, 80, 'INDIAN']] as const) {
      L.marker([lat, lon], {interactive: false, keyboard: false, icon: L.divIcon({className: 'ocean-label', html: `${label}<br/>OCEAN`, iconSize: [80, 30], iconAnchor: [40, 15]})}).addTo(atlas)
    }
    const geo = L.geoJSON(boundaries, {
      style: feature => ({fillColor: colorFor(live.current.language.records[feature!.properties.code], live.current.metric), fillOpacity: 1, color: '#fcfaf4', weight: 0.65}),
      onEachFeature: (feature, countryLayer) => {
        const code = feature.properties.code
        const polygon = countryLayer as L.Path
        countryLayer.bindTooltip(() => {
          const {language: current, locale, t} = live.current
          const record = current.records[code]
          const content = document.createElement('div')
          const heading = document.createElement('strong')
          heading.textContent = data.countries[code]?.name ?? feature.properties.name
          const value = document.createElement('span')
          value.textContent = record ? t('tooltipSpeakers', {count: compact(record.speakers), language: languageDisplayName(current.code, locale, current.name), percent: percent(record.percent)}) : t('tooltipNoEstimate', {language: languageDisplayName(current.code, locale, current.name)})
          const source = document.createElement('small')
          source.textContent = t('tooltipSource')
          content.append(heading, value, source)
          return content
        }, {sticky: true, className: 'country-tooltip', direction: 'top', offset: [0,-10]})
        countryLayer.on({
          mouseover: () => {polygon.setStyle({weight: 1.6, color:'#174f44'}); polygon.bringToFront()},
          mouseout: () => polygon.setStyle({weight: live.current.selected === code ? 2 : 0.65, color: live.current.selected === code ? '#173d34' : '#fcfaf4'}),
          click: () => live.current.onSelect(code),
        })
      },
    }).addTo(atlas)
    layer.current = geo
    atlas.fitBounds(WORLD, {padding: [12, 12], animate:false})
    const observer = new ResizeObserver(() => {atlas.invalidateSize(); atlas.fitBounds(WORLD, {padding: [12,12], animate:false})})
    observer.observe(container.current)
    return () => {observer.disconnect(); atlas.remove(); map.current = null; layer.current = null}
  }, [boundaries, data])
  useEffect(() => {
    layer.current?.eachLayer(item => {
      const polygon = item as L.Path & {feature: {properties: {code: string}}}
      const code = polygon.feature.properties.code
      polygon.setStyle({fillColor: colorFor(language.records[code], metric), weight: selected === code ? 2 : 0.65, color: selected === code ? '#173d34' : '#fcfaf4'})
      polygon.closeTooltip()
      if (selected === code) polygon.bringToFront()
    })
  }, [language, metric, selected, locale])
  return <section className="map-shell" aria-label={t('speakerMap', {language: languageDisplayName(language.code, locale, language.name)})}>
    <div ref={container} className="map" aria-label="Interactive world map. Drag to pan; use zoom controls. Country data is also available in the country list."/>
    <div className="map-caption"><span className="live-dot"/>{languageDisplayName(language.code, locale, language.name)}<span className="caption-separator">/</span>{t('worldView')}</div>
    <div className="map-controls"><button aria-label="Zoom in" onClick={() => map.current?.zoomIn()}>+</button><button aria-label="Zoom out" onClick={() => map.current?.zoomOut()}>−</button><button aria-label="Reset map view" onClick={() => map.current?.fitBounds(WORLD, {padding: [12,12]})}><Icon name="reset" size={17}/></button></div>
    <div className="legend"><div className="legend-heading"><strong>{metric === 'speakers' ? 'Estimated speakers' : 'Share of population'}</strong><span>{metric === 'speakers' ? 'Logarithmic bins' : 'Percentage bins'}</span></div><div className="legend-scale">{COLORS.map((color,i) => <div key={color}><span style={{background:color}}/><small>{LABELS[metric][i]}</small></div>)}</div><div className="legend-foot"><span><i style={{background:NO_DATA}}/>No estimate</span><span><i style={{background:ZERO_COLOR}}/>Reported zero</span><span className="legend-hint">Hover or select a country</span></div></div>
    <a className="map-attribution" href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth</a>
  </section>
}
