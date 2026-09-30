# Lingua — A world of languages

A responsive, interactive language atlas built with **Vite, React, TypeScript and Leaflet**. Explore 77 languages, switch between speaker counts and population share, hover or select countries, and search the complete country/territory list. No account, API key, map tiles or backend required.

## Run

Requires **Node.js 22.12+** (Node 24 recommended) and npm.

```sh
npm install && npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run build
npm run preview
```

`dist/` is a static site. Serve it at the root of an HTTPS origin (localhost also works) for service-worker offline support. `?lang=fr`, `?lang=en`, etc. selects a language through a shareable URL. Unknown codes fall back to French.

## What the numbers mean

The source is **Unicode CLDR**, pinned to npm package **`cldr-core@48.2.0`**. Its territory information provides territory population and language population percentage. The calculation is:

```text
estimated speakers = round(territory population × language population percentage / 100)
```

The figures represent **first- and later-language speakers where available**, not exclusively native speakers. CLDR does not supply a consistent L1/L2 breakdown, so the app deliberately has no native/total toggle. These are estimates assembled for localization, not a synchronized world census or a demographic research product. The release version is not the year of the underlying observations.

- [CLDR 48 territory-language table](https://unicode.org/cldr/charts/48/supplemental/territory_language_information.html)
- [CLDR definitions](https://cldr.unicode.org/index/cldr-spec/definitions)
- [Pinned CLDR JSON source](https://github.com/unicode-org/cldr-json/tree/48.2.0/cldr-json/cldr-core)
- [Local unmodified population source](data/source/territoryInfo.json)
- [Generated app statistics](public/data/languages.json)

No estimates are filled in, interpolated, or inferred from official-language status. Every shipped figure is tested against the retained source percentage and population. Displayed full counts are rounded arithmetic, not evidence of person-level precision. Compact numbers use approximately two significant digits.

### Coverage and known gaps

The bundle offers **77 language/code categories**, **241 map features**, and **262 searchable countries, territories and boundary units**. These are not 262 sovereign states. Most major-language communities are represented, but **complete major-language coverage for most countries cannot be claimed from this source**.

| Language category | Countries/territories with source records |
| --- | ---: |
| English | 152 |
| French | 64 |
| Spanish | 39 |
| Arabic | 38 |
| Russian | 24 |
| Chinese (`zh`) | 7 |

- **Missing is not zero.** Gray countries have no published entry for the chosen language. Their speaker counts and percentages remain absent. Small, immigrant and diaspora populations are often omitted. The all-country list and country search include missing estimates.
- Explicit source zeros are ivory and labeled separately. A reported 0% may be rounded and does not prove there are no speakers.
- Underlying observations have mixed dates, methods, fluency thresholds and quality. The JSON does not supply a reliable observation year or individual census citation for every record. The UI says “mixed reference years” and links the upstream table rather than inventing dates.
- **Some source values warrant particular caution:** CLDR reports Spanish at **31% in the Philippines**. This app retains that published percentage without independent validation and displays a caution in the selected-country panel. Do not treat every source value as a reliable contemporary estimate.
- **Mandarin is not separately measured.** Searching “Mandarin” finds the source's **Chinese (`zh`)** entry with a visible caveat. **Chinese (Traditional) (`zh_Hant`)** is a separate option. They must not be summed: for example, Hong Kong has records for both, and the categories can overlap. Other script variants likewise are not automatically merged. Cantonese, Wu, Min Nan and Hakka are separate source categories.
- The sidebar sum is only a sum of reported territory estimates. **It is not a complete global total**, and territory aggregation can overlap (particularly dependencies/overseas territories). Speakers of multiple languages appear in each relevant language; do not add totals across languages.
- CLDR's country populations, percentages and Natural Earth's boundary units do not always align, especially overseas areas. France's geometry includes overseas areas, while CLDR also has some separate territory records. These separate records remain searchable but may lack their own map polygon.

## Map and color scale

Boundaries are [Natural Earth Admin 0 countries, 1:50m, v5.1.2](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_50m_admin_0_countries.geojson), **public domain** ([terms](https://www.naturalearthdata.com/about/terms-of-use/)). The source file is retained in `data/source/countries.geojson`. The application strips unused properties, keeps the original geometry and omits Antarctica from the map. No network basemap is used. Leaflet uses an equirectangular projection (EPSG:4326); pan, zoom, touch gestures and reset are supported.

The join uses Natural Earth's `ISO_A2_EH` and CLDR territory codes. Uncoded/disputed map units use local `NE-*` IDs and receive no invented estimates. Natural Earth's two extra Australia-coded offshore units (Indian Ocean Territories and Ashmore and Cartier Islands) also get distinct `NE-*` IDs so they do not incorrectly display Australia's entire population. Countries absent from the geometry remain accessible in the list. Boundaries do not express a position on sovereignty.

- **Count:** fixed logarithmic bins: positive counts below 1k, 1k–10k, 10k–100k, 100k–1m, 1m–10m, and ≥10m. Lower bounds are inclusive, upper bounds exclusive. Fixed bins keep colors comparable across languages; counts above 10m share the darkest color.
- **Share:** below 1%, 1–5%, 5–20%, 20–50%, 50–80%, and ≥80% (same boundary convention).
- Zero is a separate class in both modes; missing data is gray.
- Rankings sort by the selected metric. The default list shows seven reported territories; “Explore all” includes missing entries. Search always searches all territories.

## Offline behavior

All geometry, statistics and fonts are served locally. After an initial page load, changing languages and using the map requires no network in either development or production.

The **production build** additionally precaches the entire app, fonts and data with `vite-plugin-pwa`/Workbox. Wait for **“Ready for offline exploration”** in the footer before disconnecting. The app then supports offline reloads and language changes. Browsers may evict storage; clearing site data removes offline availability. Service workers require HTTPS or localhost. Development mode intentionally does not install a service worker; offline reload requires the production build.

## Reproduce data

The generated data is committed and normal installation/build does not download any datasets. To regenerate it from the pinned npm dependency and retained boundaries:

```sh
npm ci
npm run data:build
npm test
```

`scripts/build-data.mjs` contains the language selection, arithmetic and join rules. `data/manifest.json` records versions, upstream URLs and SHA-256 hashes of input and output files. There are no live data fetches from third parties at runtime. For reproducible name generation, use Node 24 (English labels come from its ICU `Intl.DisplayNames`).

## Verification

```sh
npm test                 # Source arithmetic, complete selected-code coverage, joins, missing vs zero, hashes
npm run build            # TypeScript + Vite + offline precache
npx playwright install chromium
npm run test:e2e         # Runs the production preview automatically
```

Alternatively, with Google Chrome already installed:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

Browser tests cover actual SVG recoloring, both metric modes, language search/keyboard behavior, country values, missing estimates, hover/click handlers, responsive layout, offline reload and retry after a failed data request. Use the searchable list as the keyboard alternative to map polygons.

## Structure and licenses

- `src/App.tsx`: page, selected language/country, ranking and methodology.
- `src/components/WorldMap.tsx`: Leaflet lifecycle, choropleth, tooltips and legend.
- `src/components/LanguagePicker.tsx`: searchable keyboard-operated language picker.
- `src/data.ts`: data types, formatting and shared color classification.
- `public/data/`: self-contained runtime datasets.
- `data/source/`: unmodified upstream datasets; `data/manifest.json`: provenance.
- CLDR: [Unicode License v3](data/UNICODE-LICENSE.txt), included with the data.
- Fonts: bundled DM Sans and Instrument Serif, SIL Open Font License; notices in `data/DM-SANS-LICENSE.txt` and `data/INSTRUMENT-SERIF-LICENSE.txt`.

Git is initialized locally. No remote is configured or pushed.
