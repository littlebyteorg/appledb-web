export const storeLabel = (link) =>
  ({
    'app-store': 'App Store',
    'mac-app-store': 'App Store',
    'google-play': 'Google Play',
    'microsoft-store': 'Microsoft Store',
    'amazon-appstore': 'Amazon Appstore',
  })[link.type] || 'Visit website'

export const arch = (names) =>
  (names || [])
    .map((n) => ({ x86_64: '64-bit', i386: '32-bit', arm64: 'Apple silicon' })[n] || n)
    .join(', ')

export const edition = (name) =>
  name
    ? { ipad: 'iPad', red: 'RED' }[name] ||
      name
        .split('-')
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join(' ')
    : ''

export const size = (bytes) =>
  bytes ? (bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${(bytes / 1e6).toFixed(1)} MB`) : ''

export const date = (value) =>
  value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(value + 'T12:00:00Z'))
    : value || 'Date unknown'

export const variantKey = (variant) =>
  JSON.stringify([displayPlatform(variant.platform), variant.edition || ''])

export const displayPlatform = (platform) => (platform === 'Mac OS' ? 'macOS' : platform)

export function buildOverviewEntries(variants) {
  const groups = new Map()
  for (const variant of variants) {
    const key = variantKey(variant)
    if (!groups.has(key))
      groups.set(key, {
        ...variant,
        platform: displayPlatform(variant.platform),
        links: [...(variant.links || [])],
      })
    else {
      const entry = groups.get(key)
      if (variant.released && (!entry.released || variant.released < entry.released))
        entry.released = variant.released
      for (const link of variant.links || [])
        if (!entry.links.some((existing) => existing.url === link.url)) entry.links.push(link)
    }
  }
  const inactive = (variant) =>
    variant.links?.length && variant.links.every((link) => link.active === false) ? 1 : 0
  return [...groups.values()].sort(
    (a, b) =>
      inactive(a) - inactive(b) || (a.released || '9999').localeCompare(b.released || '9999'),
  )
}

export function groupDownloads(releases, variants) {
  const groups = new Map()
  const varyingFields = ['released', 'build', 'buildTrain', 'releaseNotes', 'securityNotes']
  for (const release of releases.filter((r) => r.sources?.length)) {
    const { edition: releaseEdition, sources, legacyId, ...metadata } = release
    const key = JSON.stringify(
      Object.keys(metadata)
        .filter((k) => !varyingFields.includes(k))
        .sort()
        .map((k) => [k, metadata[k]]),
    )
    if (!groups.has(key)) groups.set(key, { ...metadata, sources: [], storeLinks: [], members: [] })
    const group = groups.get(key)
    group.members.push(release)
    group.sources.push(
      ...sources.map((source) => ({
        ...source,
        releaseEdition,
        releaseMetadata: Object.fromEntries(varyingFields.map((field) => [field, release[field]])),
      })),
    )
    for (const link of linksForRelease(release, variants))
      if (!group.storeLinks.some((l) => l.url === link.url)) group.storeLinks.push(link)
  }
  return [...groups.values()].map((group) => {
    for (const field of varyingFields) {
      if (
        group.members.some(
          (member) => JSON.stringify(member[field]) !== JSON.stringify(group.members[0][field]),
        )
      ) {
        delete group[field]
        for (const source of group.sources)
          source['file' + field[0].toUpperCase() + field.slice(1)] = source.releaseMetadata[field]
      }
    }
    delete group.members
    return group
  })
}

export function buildHistoryRows(versions, excluded = []) {
  return versions
    .flatMap((v) => {
      const groups = new Map()
      for (const release of v.releases) {
        if (excluded.includes(variantKey(release))) continue
        const key = JSON.stringify([
          release.released || '',
          release.build || '',
          !!release.beta,
          !!release.rc,
        ])
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(release)
      }
      return [...groups].map(([groupKey, releases]) => ({
        ...v,
        releases,
        rowKey: v.key + '-' + groupKey,
      }))
    })
    .sort(
      (a, b) =>
        (b.releases[0].released || '').localeCompare(a.releases[0].released || '') ||
        b.version.localeCompare(a.version, undefined, { numeric: true }),
    )
}

export function summarizeReleases(releases) {
  const rows = releases
  const dates = [...new Set(rows.map((r) => r.released).filter(Boolean))]
  const builds = [...new Set(rows.map((r) => r.build).filter(Boolean))]
  const statuses = [...new Set(rows.map((r) => (r.rc ? 'RC' : r.beta ? 'Beta' : 'Release')))]
  return {
    statuses,
    status: statuses.length === 1 ? statuses[0] : 'Mixed releases',
    date: dates.length ? date([...dates].sort()[0]) : 'Date unknown',
    build: builds.length === 1 ? builds[0] : null,
  }
}

export function file(source) {
  const segment = source.links[0].url.split('/').pop().split('?')[0]
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}
export const noteUrl = (note) => (typeof note === 'string' ? note : note?.url)
export const downloadLink = (source) => source.links.find((link) => link.active) || source.links[0]
export const hasActiveDownload = (source) => source.links.some((link) => link.active)
export const linksForRelease = (release, variants) =>
  release.storeLinks ||
  variants.find(
    (variant) => variant.platform === release.platform && variant.edition === release.edition,
  )?.links ||
  []
export const hasContext = (release) =>
  !release.preinstalledOS &&
  !release.sources?.length &&
  !!(
    release.safariVersion ||
    release.rc ||
    release.internal ||
    release.osMap?.length ||
    release.buildTrain ||
    release.build ||
    release.releaseNotes ||
    release.securityNotes
  )
export function toggleExcludedPlatform(variants, excluded, variant) {
  if (new Set(variants.map((entry) => displayPlatform(entry.platform))).size <= 1) return excluded
  const key = variantKey(variant)
  if (excluded.includes(key)) return excluded.filter((value) => value !== key)
  if (
    buildOverviewEntries(variants).filter((entry) => !excluded.includes(variantKey(entry)))
      .length <= 1
  )
    return excluded
  return [...excluded, key]
}

// Match all query terms within one release, so unrelated releases cannot
// combine to produce a false match. Version results require a version/build term.
export function searchCatalog(catalog, query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const apps = []
  const versions = []
  for (const app of catalog) {
    const base =
      `${app.name} ${app.variants.map((variant) => variant.platform).join(' ')}`.toLowerCase()
    let matchesApp = terms.every((term) => base.includes(term))
    for (const version of app.versions) {
      let matchesVersion = false
      for (const release of version.releases) {
        const text =
          `${app.name} ${version.version} ${release.platform} ${release.build || ''}`.toLowerCase()
        if (!terms.every((term) => text.includes(term))) continue
        matchesApp = true
        const releaseText = `${version.version} ${release.build || ''}`.toLowerCase()
        if (terms.some((term) => releaseText.includes(term))) matchesVersion = true
      }
      if (matchesVersion) versions.push({ app, version })
    }
    if (matchesApp) apps.push(app)
  }
  return { apps, versions }
}

export function catalogVersionRows(catalog, query = '') {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return catalog
    .flatMap((app) =>
      app.versions
        .filter((version) =>
          version.releases.some((release) => {
            const text =
              `${app.name} ${version.version} ${release.platform} ${release.build || ''}`.toLowerCase()
            return terms.every((term) => text.includes(term))
          }),
        )
        .map((version) => ({
          app,
          version,
          released:
            version.releases
              .map((release) => release.released || '')
              .sort()
              .pop() || '',
        })),
    )
    .sort(
      (a, b) =>
        b.released.localeCompare(a.released) ||
        a.app.name.localeCompare(b.app.name) ||
        b.version.version.localeCompare(a.version.version, undefined, { numeric: true }),
    )
}
