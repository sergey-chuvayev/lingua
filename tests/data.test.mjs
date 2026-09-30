import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
const load = path => JSON.parse(fs.readFileSync(path, 'utf8'))
const data = load('public/data/languages.json')
const source = load('data/source/territoryInfo.json').supplemental.territoryInfo
const boundaries = load('public/data/countries.geojson')

test('every shipped estimate matches a published CLDR percentage and population', () => {
  assert.ok(data.languages.length >= 20)
  for (const language of data.languages) {
    for (const [code, record] of Object.entries(language.records)) {
      const original = source[code].languagePopulation[language.code]
      assert.ok(original, `${language.code}/${code} exists in source`)
      assert.equal(record.percent, Number(original._populationPercent))
      assert.equal(record.speakers, Math.round(Number(source[code]._population) * record.percent / 100))
      assert.equal(data.countries[code].population, Number(source[code]._population))
      assert.ok(record.percent >= 0 && record.percent <= 100)
    }
  }
})
test('bundled records preserve all source territories for each selected language', () => {
  for (const language of data.languages) {
    const expected = Object.entries(source).filter(([code,value]) => code !== 'ZZ' && value.languagePopulation?.[language.code]).map(([code]) => code).sort()
    assert.deepEqual(Object.keys(language.records).sort(), expected)
  }
})
test('geometry joins are explicit, with no fabricated estimates in disputed areas', () => {
  assert.ok(boundaries.features.length > 200)
  const codes = boundaries.features.map(f=>f.properties.code)
  assert.equal(new Set(codes).size, codes.length)
  for (const code of codes) assert.ok(data.countries[code]?.mapped, code)
  for (const language of data.languages) for (const code of codes.filter(code=>code.startsWith('NE-'))) assert.equal(language.records[code], undefined)
})
test('missing data and explicit source zero remain distinct', () => {
  assert.equal(data.languages.find(l=>l.code === 'fr').records.CN, undefined)
  assert.equal(data.languages.find(l=>l.code === 'en').records.AQ, undefined)
  assert.ok(Object.values(source.US.languagePopulation).some(record => record._populationPercent === '0'))
  assert.ok(data.languages.some(l=>Object.values(l.records).some(r=>r.speakers===0)))
})
test('Chinese script populations are not silently merged or labeled Mandarin', () => {
  const chinese = data.languages.find(l=>l.code==='zh')
  const traditional = data.languages.find(l=>l.code==='zh_Hant')
  assert.equal(chinese.records.HK.percent, 5)
  assert.equal(traditional.records.HK.percent, 95)
  assert.equal(chinese.name, 'Chinese')
  assert.ok(chinese.note.includes('not a Mandarin-only'))
})
test('source and generated artifacts match the provenance manifest', () => {
  for (const [path,expected] of Object.entries(load('data/manifest.json').checksums)) assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),expected,path)
})
