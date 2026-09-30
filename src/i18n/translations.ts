export type Locale = 'en' | 'ru'

export const translations = {
  en: {
    // Header
    skipToAtlas: 'Skip to atlas',
    brandTitle: 'lingua',
    brandDescription: 'THE LANGUAGE ATLAS',
    aboutData: 'About the data',
    
    // Intro
    eyebrow: 'MANY VOICES. ONE WORLD.',
    heroTitle: 'A world of <em>languages.</em>',
    heroSubtitle: 'Discover where languages live, one country at a time.',
    introNote: 'Explore the connections<br/>that cross our borders.',
    
    // Loading
    loadingTitle: 'Opening the atlas…',
    loadingMessage: 'Loading countries and language estimates.',
    errorTitle: 'The atlas needs a moment.',
    errorMessage: 'The atlas data could not be loaded. Check your connection and try again.',
    tryAgain: 'Try again',
    
    // Explorer toolbar
    exploreLabel: 'Map settings',
    popularLanguagesTry: 'Try',
    metricLabel: 'Color map by',
    speakerCount: 'Speaker count',
    populationPercent: 'Population %',
    
    // Language picker
    exploreLanguage: 'Explore a language',
    searchLanguages: 'Search languages',
    searchLanguagesPlaceholder: 'Search {{count}} languages…',
    noMatchingLanguages: 'No matching languages. Try another name.',
    languagesCount: '{{count}} languages',
    unicodeCLDR: 'Unicode CLDR',
    
    // Country panel
    theBiggerPicture: 'THE BIGGER PICTURE',
    speakersInTerritories: 'speakers in reported territories',
    countriesWithData: 'countries & territories with data',
    
    // Country detail
    countrySpotlight: 'COUNTRY SPOTLIGHT',
    closeCountryDetails: 'Close country details',
    speakers: '{{language}} speakers',
    shareOfPopulation: 'Share of population',
    sourcePopulation: 'Source population',
    unavailable: 'Unavailable',
    noEstimate: 'No estimate for {{language}} in this country. Missing data does not mean there are no speakers.',
    sourceCautionES: 'Source caution: CLDR reports 31% for Spanish here. This figure has not been independently validated.',
    detailSource: 'Unicode CLDR 48.2 · Mixed reference years<br/>First- and later-language speakers where available.',
    noPolygon: 'This territory has no separate polygon at this map scale.',
    zeroPercent: 'CLDR reports 0%; this may reflect rounding, not an absence of speakers.',
    
    // Ranking
    whereSpoken: 'Where it\'s spoken',
    allCountries: 'All countries & territories',
    rankingSpeakers: 'SPEAKERS',
    rankingShare: 'SHARE',
    
    // Country search
    findCountry: 'Find a country',
    findCountryPlaceholder: 'Find a country…',
    clearCountrySearch: 'Clear country search',
    noCountriesMatch: 'No countries match "{{query}}".',
    
    // View all
    showTopCountries: 'Show top countries',
    exploreAllCountries: 'Explore all {{count}} countries & territories',
    noDataEstimate: 'No estimate',
    
    // Atlas footnote
    footnoteEstimates: 'Estimates, not a census. Missing data never means zero speakers.',
    howToRead: 'How to read this map',
    
    // Methodology
    methodologyEyebrow: 'BEHIND THE NUMBERS',
    methodologyTitle: 'An atlas with an open book.',
    methodologyToggle: 'Sources & limitations',
    
    methodologyRealDataTitle: 'Real data. Approximate counts.',
    methodologyRealDataText: 'Counts are calculated from Unicode CLDR 48.2\'s territory population × language population percentage, rounded to a person. They include first- and later-language speakers where available; the source does not provide a consistent native-speaker split.',
    methodologyReadSource: 'Read the CLDR source table ↗',
    
    methodologyCoverageTitle: 'Coverage has edges.',
    methodologyCoverageText1: 'Source records combine different reference years and methods. Small and diaspora populations are often missing. Totals cover reported territories only, and are not complete global totals. Script variants are kept separate to avoid double-counting.',
    methodologyCoverageText2: 'CLDR is intended for localization, not demographic research. Notable source values, such as Spanish at 31% in the Philippines, are retained without independent validation.',
    methodologyCoverageText3: 'Boundaries: Natural Earth 1:50m, v5.1.2. Some small territories are available only in the list. Borders are for visualization, not a statement of sovereignty.',
    
    methodologyScaleTitle: 'A scale you can compare.',
    methodologyScaleText: 'Speaker counts use fixed logarithmic bins so smaller communities remain visible. Population share uses fixed percentage bins. Gray means no estimate; ivory means an explicit zero in the source, which may be rounded.',
    methodologyDownload: 'Download the bundled dataset ↓',
    
    // Footer
    footerQuote: 'Every language is a different way of seeing the world.',
    offlineReady: 'Ready for offline exploration',
    offlineNotReady: 'Bundled data · no map tiles',
    madeFor: 'Made for the curious.',
  },
  ru: {
    // Header
    skipToAtlas: 'Перейти к атласу',
    brandTitle: 'lingua',
    brandDescription: 'АТЛАС ЯЗЫКОВ',
    aboutData: 'О данных',
    
    // Intro
    eyebrow: 'МНОЖЕСТВО ГОЛОСОВ. ЕДИНЫЙ МИР.',
    heroTitle: 'Мир <em>языков.</em>',
    heroSubtitle: 'Узнайте, где живут языки, по одной стране за раз.',
    introNote: 'Исследуйте связи,<br/>пересекающие границы.',
    
    // Loading
    loadingTitle: 'Открываем атлас…',
    loadingMessage: 'Загружаем страны и оценки численности носителей.',
    errorTitle: 'Атласу нужно немного времени.',
    errorMessage: 'Не удалось загрузить данные атласа. Проверьте подключение и попробуйте снова.',
    tryAgain: 'Попробовать снова',
    
    // Explorer toolbar
    exploreLabel: 'Настройки карты',
    popularLanguagesTry: 'Попробуйте',
    metricLabel: 'Раскрасить карту по',
    speakerCount: 'Количество носителей',
    populationPercent: '% населения',
    
    // Language picker
    exploreLanguage: 'Выберите язык',
    searchLanguages: 'Поиск языков',
    searchLanguagesPlaceholder: 'Поиск среди {{count}} языков…',
    noMatchingLanguages: 'Языки не найдены. Попробуйте другое название.',
    languagesCount: '{{count}} языков',
    unicodeCLDR: 'Unicode CLDR',
    
    // Country panel
    theBiggerPicture: 'ОБЩАЯ КАРТИНА',
    speakersInTerritories: 'носителей на учтённых территориях',
    countriesWithData: 'стран и территорий с данными',
    
    // Country detail
    countrySpotlight: 'СТРАНА В ЦЕНТРЕ ВНИМАНИЯ',
    closeCountryDetails: 'Закрыть информацию о стране',
    speakers: 'Носителей {{language}}',
    shareOfPopulation: 'Доля населения',
    sourcePopulation: 'Население по источнику',
    unavailable: 'Недоступно',
    noEstimate: 'Нет оценки для {{language}} в этой стране. Отсутствие данных не означает отсутствие носителей.',
    sourceCautionES: 'Предупреждение об источнике: CLDR сообщает 31% для испанского здесь. Эта цифра не была независимо подтверждена.',
    detailSource: 'Unicode CLDR 48.2 · Смешанные годы отчётности<br/>Носители первого и последующих языков, где доступно.',
    noPolygon: 'Эта территория не имеет отдельного полигона в данном масштабе карты.',
    zeroPercent: 'CLDR сообщает 0%; это может отражать округление, а не отсутствие носителей.',
    
    // Ranking
    whereSpoken: 'Где говорят',
    allCountries: 'Все страны и территории',
    rankingSpeakers: 'НОСИТЕЛИ',
    rankingShare: 'ДОЛЯ',
    
    // Country search
    findCountry: 'Найти страну',
    findCountryPlaceholder: 'Найти страну…',
    clearCountrySearch: 'Очистить поиск страны',
    noCountriesMatch: 'Нет стран, соответствующих "{{query}}".',
    
    // View all
    showTopCountries: 'Показать топ стран',
    exploreAllCountries: 'Исследовать все {{count}} стран и территорий',
    noDataEstimate: 'Нет оценки',
    
    // Atlas footnote
    footnoteEstimates: 'Оценки, а не перепись. Отсутствие данных никогда не означает ноль носителей.',
    howToRead: 'Как читать эту карту',
    
    // Methodology
    methodologyEyebrow: 'ЗА ЦИФРАМИ',
    methodologyTitle: 'Атлас с открытой книгой.',
    methodologyToggle: 'Источники и ограничения',
    
    methodologyRealDataTitle: 'Реальные данные. Приблизительные подсчёты.',
    methodologyRealDataText: 'Подсчёты рассчитываются из населения территории Unicode CLDR 48.2 × процент населения, говорящего на языке, округлённый до человека. Они включают носителей первого и последующих языков, где доступно; источник не предоставляет последовательного разделения на носителей родного языка.',
    methodologyReadSource: 'Читать исходную таблицу CLDR ↗',
    
    methodologyCoverageTitle: 'Охват имеет границы.',
    methodologyCoverageText1: 'Исходные записи сочетают разные годы отчётности и методы. Малые и диаспорные популяции часто отсутствуют. Итоги охватывают только указанные территории и не являются полными глобальными итогами. Варианты письма разделены, чтобы избежать двойного подсчёта.',
    methodologyCoverageText2: 'CLDR предназначен для локализации, а не для демографических исследований. Примечательные значения источника, такие как испанский на 31% на Филиппинах, сохранены без независимой проверки.',
    methodologyCoverageText3: 'Границы: Natural Earth 1:50m, v5.1.2. Некоторые малые территории доступны только в списке. Границы для визуализации, а не заявление о суверенитете.',
    
    methodologyScaleTitle: 'Масштаб, который можно сравнивать.',
    methodologyScaleText: 'Подсчёты носителей используют фиксированные логарифмические бины, чтобы меньшие сообщества оставались видимыми. Доля населения использует фиксированные процентные бины. Серый означает отсутствие оценки; цвет слоновой кости означает явный ноль в источнике, который может быть округлён.',
    methodologyDownload: 'Скачать объединённый набор данных ↓',
    
    // Footer
    footerQuote: 'Каждый язык — это иной способ видеть мир.',
    offlineReady: 'Готово для автономного изучения',
    offlineNotReady: 'Объединённые данные · нет тайлов карты',
    madeFor: 'Создано для любопытных.',
  },
} as const

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? ''))
}
