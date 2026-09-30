# Language atlas design

Build a single-page Vite + React + TypeScript atlas. Leaflet renders local Natural Earth polygons without third-party map tiles. A searchable language picker controls choropleth colors, ranked country rows, summary coverage and details. Count uses fixed logarithmic bins; share uses fixed percentage bins. Hover shows a tooltip; click or a keyboard-accessible country row opens a detail panel. A searchable all-country list includes missing estimates and small territories.

Use Unicode CLDR 48.2 language population percentages multiplied by the same release's territory population. Keep source language codes intact, including script variants. Never fabricate missing records or merge potentially overlapping populations. Present Chinese as the source's Chinese category, with a Mandarin search alias and explicit caveat rather than relabeling it Mandarin-only. Publish source files, pinned versions, reproduction script, licenses and limitations.

An editorial light interface uses warm neutrals, teal colors, serif titles and compact sans-serif controls. Stack map and country sidebar on phones. Keep country details in document flow. Bundle fonts, geometry and statistics; precache production assets with a service worker and report readiness only once the worker is active.

Alternatives: MapLibre offers GPU rendering but unnecessary complexity for this data size; a custom SVG projection offers typographic freedom but would require custom navigation. Leaflet provides reliable navigation and local geometry with minimal infrastructure.

Validate source-to-output arithmetic and joins, no-data semantics and minimum language coverage with Node tests. Verify real map recoloring, language search, mobile layout, country details and production offline reload with Playwright. Run TypeScript and Vite build.
