import type { FeatureCollection, Geometry } from 'geojson'
export type SpeakerRecord = { speakers: number; percent: number; status?: string }
export type Country = {name: string; population: number | null; mapped: boolean}
export type Language = {code: string; name: string; native: string; aliases?: string[]; note?: string; records: Record<string, SpeakerRecord>}
export type Dataset = {version: string; release: string; sourceUrl: string; definition: string; countries: Record<string, Country>; languages: Language[]}
export type Boundaries = FeatureCollection<Geometry, {code: string; name: string}>
export type Metric = 'speakers' | 'percent'
export const COLORS = ['#d9ede2', '#aed9c6', '#77bea4', '#429880', '#22745f', '#0c4c40']
export const NO_DATA = '#e3e5df'
export const ZERO_COLOR = '#faf9f4'
export const BINS = {speakers: [1_000, 10_000, 100_000, 1_000_000, 10_000_000], percent: [1, 5, 20, 50, 80]}
export const LABELS = {speakers: ['<1k', '1k–10k', '10k–100k', '100k–1m', '1m–10m', '10m+'], percent: ['<1%', '1–5%', '5–20%', '20–50%', '50–80%', '80%+']}
export function colorFor(record: SpeakerRecord | undefined, metric: Metric) {
  if (!record) return NO_DATA
  if (record[metric] === 0) return ZERO_COLOR
  const index = BINS[metric].findIndex(limit => record[metric] < limit)
  return COLORS[index === -1 ? COLORS.length - 1 : index]
}
export const compact = (value: number) => new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 1}).format(value)
export const number = (value: number) => new Intl.NumberFormat('en').format(value)
export const percent = (value: number) => new Intl.NumberFormat('en', {maximumFractionDigits: 4}).format(value) + '%'
export const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
