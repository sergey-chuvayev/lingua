import { readFile, writeFile, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const read = async path => JSON.parse(await readFile(path, 'utf8'))
const source = await read('node_modules/cldr-core/supplemental/territoryInfo.json')
const boundaries = await read('data/source/countries.geojson')
const regions = new Intl.DisplayNames('en', { type: 'region' })
const names = new Intl.DisplayNames('en', { type: 'language' })
// Preserve CLDR codes: script variants can overlap, and must not be added together.
const featured = ['en','fr','es','ar','ru','zh','zh_Hant','pt','de','hi','bn','ja','ko','it','tr','vi','ta','te','ur','pa','fa','id','ms','sw','nl','pl','uk','ro','hu','el','cs','sv','da','fi','nb','th','he','am','ha','yo','zu','af','ca','eu','gl','gu','mr','ne','si','my','km','lo','fil','jv','su','yue','wuu','nan','hak','az','uz','kk','so','ps','sr','hr','sk','bg','lt','lv','et','is','ga','cy','hy','ka','mn']
const native = {en:'English',fr:'Français',es:'Español',ar:'العربية',ru:'Русский',zh:'中文',zh_Hant:'繁體中文',pt:'Português',de:'Deutsch',hi:'हिन्दी',bn:'বাংলা',ja:'日本語',ko:'한국어',it:'Italiano',tr:'Türkçe',vi:'Tiếng Việt',ta:'தமிழ்',ur:'اردو',fa:'فارسی',sw:'Kiswahili'}
const features = boundaries.features.filter(f => f.properties.ISO_A2_EH !== 'AQ').map(f => ({
  type: 'Feature',
  properties: { code: (f.properties.ISO_A2_EH === '-99' || ['IOA', 'ATC'].includes(f.properties.ADM0_A3)) ? `NE-${f.properties.ADM0_A3}` : f.properties.ISO_A2_EH, name: f.properties.NAME_LONG },
  geometry: f.geometry,
}))
const mapped = new Set(features.map(f => f.properties.code))
const countries = Object.fromEntries(Object.entries(source.supplemental.territoryInfo).filter(([code]) => code !== 'ZZ').map(([code, value]) => [code, {name: regions.of(code), population: Number(value._population), mapped: mapped.has(code)}]))
for (const feature of features) if (!countries[feature.properties.code]) countries[feature.properties.code] = {name: feature.properties.name, population: null, mapped: true}
const languages = featured.map(code => {
  const records = {}
  for (const [country, value] of Object.entries(source.supplemental.territoryInfo)) {
    if (!countries[country]) continue
    const record = value.languagePopulation?.[code]
    if (!record) continue
    const percent = Number(record._populationPercent)
    records[country] = { percent, speakers: Math.round(Number(value._population) * percent / 100), ...(record._officialStatus ? {status: record._officialStatus} : {}) }
  }
  return {code, name: names.of(code.replaceAll('_', '-')), native: native[code] ?? '', ...(code === 'zh' ? {aliases: ['Mandarin'], note: 'CLDR reports Chinese (zh), not a Mandarin-only census. Traditional-script Chinese is a separate entry; these categories may overlap and are not combined.'} : {}), ...(code === 'zh_Hant' ? {note: 'Traditional-script Chinese is reported separately in CLDR. Script categories can overlap with Chinese (zh); do not add them together.'} : {}), records}
}).filter(language => Object.keys(language.records).length)
const data = {version: '48.2.0', release: 'CLDR 48.2', sourceUrl: 'https://unicode.org/cldr/charts/48/supplemental/territory_language_information.html', definition: 'Estimated first- and later-language speakers where available; no native/second-language split.', countries, languages}
await writeFile('public/data/languages.json', JSON.stringify(data))
await writeFile('public/data/countries.geojson', JSON.stringify({type: 'FeatureCollection', features}))
await copyFile('node_modules/cldr-core/supplemental/territoryInfo.json', 'data/source/territoryInfo.json')
await copyFile('node_modules/cldr-core/LICENSE', 'data/UNICODE-LICENSE.txt')
const manifest = {cldr: {package:'cldr-core', version:'48.2.0', source:'https://github.com/unicode-org/cldr-json/tree/48.2.0/cldr-json/cldr-core'}, boundaries: {version:'5.1.2', source:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson'}, checksums: {}}
for (const path of ['data/source/territoryInfo.json','data/source/countries.geojson','public/data/languages.json','public/data/countries.geojson']) manifest.checksums[path] = createHash('sha256').update(await readFile(path)).digest('hex')
await writeFile('data/manifest.json', JSON.stringify(manifest, null, 2) + '\n')
console.log(`${languages.length} languages; ${Object.keys(countries).length} countries/territories; ${features.length} map features`)
for (const code of ['en','fr','es','ar','ru','zh']) console.log(code, Object.keys(languages.find(l=>l.code===code).records).length, 'source records')
