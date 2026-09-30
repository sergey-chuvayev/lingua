import {test, expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
import type {Dataset} from '../../src/data'
import {languageDisplayName} from '../../src/i18n/languageDisplayName'

const data: Dataset = JSON.parse(readFileSync('public/data/languages.json', 'utf8'))

test('pointer selection has no trigger ring while keyboard selection and Escape restore visible focus', async ({page}) => {
  await page.goto('/lingua/')
  const trigger = page.locator('.language-trigger')
  const input = page.getByRole('combobox')
  await trigger.click()
  await input.fill('Cantonese')
  await page.getByRole('option').click()
  await expect(trigger).toContainText('Cantonese')
  await expect(trigger).not.toBeFocused()
  await expect(trigger).toHaveCSS('outline-style', 'none')
  await trigger.click()
  await input.fill('French')
  await input.press('Enter')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveCSS('outline-style', 'solid')
  await trigger.press('Enter')
  await input.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveCSS('outline-style', 'solid')
  await page.getByRole('button', {name:'English', exact:true}).click()
  await expect(page.getByRole('button', {name:'English', exact:true})).toHaveCSS('outline-style', 'none')
})

test('RU/EN names, localized search, country estimates and current-language marker', async ({page}) => {
  await page.goto('/lingua/?lang=yue')
  await page.getByRole('button', {name:'RU', exact:true}).click()
  await expect(page.locator('.language-trigger')).toContainText('кантонский')
  await expect(page.locator('.map-caption')).toContainText('кантонский')
  await expect(page.locator('.panel-heading h2')).toContainText('кантонский')
  await expect(page.locator('.popular-languages')).toContainText('английский')
  await page.locator('.language-trigger').click()
  await page.getByRole('combobox').fill('French')
  await expect(page.getByRole('option')).toHaveCount(1)
  await page.getByRole('combobox').fill('французский')
  await expect(page.getByRole('option')).toHaveCount(1)
  await page.getByRole('combobox').press('Enter')
  await page.getByRole('textbox', {name:'Найти страну'}).fill('France')
  await page.locator('.country-list button').click()
  const expected = data.languages.filter((l) => l.records.FR).sort((a,b) => b.records.FR.speakers-a.records.FR.speakers || a.code.localeCompare(b.code))
  const rows = page.locator('.country-languages li')
  await expect(rows).toHaveCount(expected.length)
  for (let index = 0; index < expected.length; index++) {
    const item = expected[index]
    await expect(rows.nth(index)).toContainText(new Intl.DisplayNames('ru', {type:'language'}).of(item.code.replaceAll('_','-'))!)
    await expect(rows.nth(index)).toContainText(new Intl.NumberFormat('en').format(item.records.FR.speakers))
    await expect(rows.nth(index)).toContainText(new Intl.NumberFormat('en', {maximumFractionDigits:4}).format(item.records.FR.percent)+'%')
  }
  await expect(page.locator('.country-languages [aria-current=true]')).toContainText('французский')
  await page.getByRole('button', {name:'EN', exact:true}).click()
  await expect(page.locator('.country-languages h4')).toHaveText('Languages spoken here')
  await expect(page.locator('.country-languages [aria-current=true]')).toContainText('French')
  await expect(page.locator('.map-caption')).toContainText('French')
})

test('country with no bundled records has an empty state', async ({page}) => {
  await page.route('**/data/languages.json', async route => {
    const copy = structuredClone(data)
    for (const language of copy.languages) delete language.records.FR
    await route.fulfill({json:copy})
  })
  await page.goto('/lingua/')
  await page.getByRole('textbox', {name:'Find a country'}).fill('France')
  await page.locator('.country-list button').click()
  await expect(page.locator('.country-languages')).toContainText('No language estimates are available')
})

test('display names cover every bundled code and preserve fallbacks', () => {
  for (const locale of ['en', 'ru'] as const) {
    const names = new Intl.DisplayNames(locale, {type:'language', fallback:'none'})
    for (const language of data.languages) {
      const expected = names.of(language.code.replaceAll('_', '-'))
      expect(expected).toBeTruthy()
      expect(languageDisplayName(language.code, locale, language.name)).toBe(expected)
    }
    expect(languageDisplayName('not_a_valid_tag', locale, 'Dataset name')).toBe('Dataset name')
    expect(languageDisplayName('qzz', locale, 'Dataset name')).toBe('Dataset name')
  }
})
