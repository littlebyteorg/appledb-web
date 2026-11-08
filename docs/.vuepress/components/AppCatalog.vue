<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { usePageFrontmatter } from '@vuepress/client'
import {
  searchCatalog,
  catalogVersionRows,
  displayPlatform,
  variantKey,
  date,
  size,
  edition,
  arch,
  storeLabel,
  file,
  buildOverviewEntries,
  groupDownloads,
  buildHistoryRows,
  summarizeReleases,
  noteUrl,
  downloadLink,
  hasActiveDownload,
  linksForRelease,
  hasContext,
  toggleExcludedPlatform,
} from '../lib/app-catalog.mjs'
const props = defineProps({
  catalog: { type: Array, default: () => [] },
  bundledOSLinks: { type: Object, default: () => ({}) },
})
const bundledOSMatches = (label, released) => {
  const rows = props.bundledOSLinks[label] || []
  const exact = rows.filter((row) => row.released === released)
  return exact.length === 1 ? exact : rows.length === 1 ? rows : []
}

const fallbackIcon = (event) => {
  if (!event.target.src.endsWith('/placeholder.svg'))
    event.target.src = '/app-icons/placeholder.svg'
}
const fm = usePageFrontmatter()
const search = ref('')
const showVersions = ref(false)
const catalogViewStorageKey = 'appledb.catalog.view'
// Restore after hydration so the initial client render matches the static page.
onMounted(() => {
  try {
    showVersions.value = sessionStorage.getItem(catalogViewStorageKey) === 'versions'
  } catch {
    // Browsing still works when storage is unavailable.
  }
})
watch(
  showVersions,
  (enabled) => {
    try {
      sessionStorage.setItem(catalogViewStorageKey, enabled ? 'versions' : 'apps')
    } catch {
      // Keep the toggle usable when browser storage is blocked.
    }
  },
  { flush: 'sync' },
)
const versionRows = computed(() => catalogVersionRows(props.catalog, search.value))
const catalogRows = computed(() =>
  showVersions.value ? versionRows.value : matchingVersions.value,
)
const copied = ref('')
const expandedHashes = ref({})
const app = computed(() => props.catalog.find((a) => a.id === fm.value.appId))
const excludedPlatforms = ref([])
watch(
  () => fm.value.appId,
  () => {
    excludedPlatforms.value = []
  },
)

const canFilterPlatforms = computed(
  () => new Set((app.value?.variants || []).map((v) => displayPlatform(v.platform))).size > 1,
)
const isLastSelectedPlatform = (variant) =>
  !excludedPlatforms.value.includes(variantKey(variant)) &&
  overviewEntries.value.filter((entry) => !excludedPlatforms.value.includes(variantKey(entry)))
    .length <= 1
const togglePlatform = (variant) => {
  excludedPlatforms.value = toggleExcludedPlatform(
    app.value?.variants || [],
    excludedPlatforms.value,
    variant,
  )
}

const version = computed(() => app.value?.versions.find((v) => v.key === fm.value.versionKey))

const searchResults = computed(() => searchCatalog(props.catalog, search.value))
const visibleApps = computed(() => searchResults.value.apps)
const matchingVersions = computed(() => searchResults.value.versions)
const releases = computed(() => version.value?.releases || [])

const datesFor = (version) => {
  const groups = new Map()
  for (const release of version.releases) {
    const key = release.released || ''
    if (!groups.has(key)) groups.set(key, [])
    groups
      .get(key)
      .push(release.platform + (release.edition ? ' · ' + edition(release.edition) : ''))
  }
  return [...groups]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([value, platforms]) => ({
      value,
      label: groups.size > 1 ? [...new Set(platforms)].join(', ') : '',
    }))
}
const buildsFor = (version) => {
  const known = version.releases.filter((r) => r.build)
  const builds = [...new Set(known.map((r) => r.build))]
  return builds.map((build) => ({
    build,
    label:
      known.length === version.releases.length && builds.length === 1
        ? ''
        : [
            ...new Set(
              known
                .filter((r) => r.build === build)
                .map((r) => r.platform + (r.edition ? ' · ' + edition(r.edition) : '')),
            ),
          ].join(', '),
  }))
}

const headerStores = computed(() => {
  const variants = version.value
    ? app.value?.variants.filter((v) =>
        version.value.releases.some((r) => r.platform === v.platform && r.edition === v.edition),
      )
    : app.value?.variants
  return (variants || []).flatMap((v) =>
    (v.links || []).map((link) => ({ ...link, platform: v.platform, edition: v.edition })),
  )
})
const sdkUrl = (sdk) =>
  `https://appledb.dev/firmware/${encodeURIComponent(sdk.osStr.replace(/ /g, '-'))}/${encodeURIComponent(sdk.build + '-SDK')}.html`
const sharedSystems = (release) => {
  const sources = release.sources || []
  const systems = sources[0]?.osMap || []
  return systems.length && sources.every((s) => JSON.stringify(s.osMap) === JSON.stringify(systems))
    ? systems
    : []
}
const linksFor = (release) => linksForRelease(release, app.value?.variants || [])

const downloadVariant = (source) => {
  if (source.type !== 'apk') return ''
  const name = file(source)
  if (name.includes('-universal-')) return 'Universal'
  if (name.includes('-arm64-v8a-')) return 'ARM64'
  return ''
}

const overviewEntries = computed(() => buildOverviewEntries(app.value?.variants || []))
const historyRows = computed(() =>
  buildHistoryRows(app.value?.versions || [], excludedPlatforms.value),
)
const directReleases = computed(() => groupDownloads(releases.value, app.value?.variants || []))
const summary = computed(() => summarizeReleases(releases.value))
const contextReleases = computed(() => releases.value.filter(hasContext))
const bundledReleases = computed(() => releases.value.filter((release) => release.preinstalledOS))
const showReleaseDetails = computed(
  () =>
    contextReleases.value.length ||
    bundledReleases.value.length ||
    directReleases.value.some(
      (release) =>
        release.buildTrain ||
        release.osMap?.length ||
        release.releaseNotes ||
        release.securityNotes,
    ),
)
async function copyHash(value) {
  try {
    await navigator.clipboard.writeText(value)
    copied.value = value
    setTimeout(() => (copied.value = ''), 1800)
  } catch {
    copied.value = ''
  }
}
</script>

<template>
  <div class="app-catalog">
    <template v-if="!app">
      <header class="catalog-heading">
        <div>
          <p class="eyebrow">APPLEDB</p>
          <h1>Apps</h1>
          <p class="muted">Explore apps, releases, and downloads across platforms.</p>
        </div>
        <span class="count">{{ catalog.length }} apps</span>
      </header>
      <div class="catalog-view-controls">
        <label class="search"
          ><svg
            class="search-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4.5 4.5" /></svg
          ><input
            v-model="search"
            type="search"
            aria-label="Search apps, platforms, versions, or builds"
            placeholder="Search apps, platforms, versions, or builds"
        /></label>
        <button
          type="button"
          class="catalog-view-toggle"
          :aria-pressed="showVersions"
          @click="showVersions = !showVersions"
        >
          {{ showVersions ? 'Show apps' : 'Show versions' }}
        </button>
      </div>
      <span v-if="showVersions" class="muted catalog-version-count"
        >{{ versionRows.length }} versions</span
      >
      <div v-if="showVersions || matchingVersions.length" class="release-search-results">
        <RouterLink
          v-for="result in catalogRows"
          :key="result.app.id + '-' + result.version.key"
          :to="`/app/${result.app.id}/${result.version.key}.html`"
          class="release-search-row"
          ><img :src="result.app.icon" @error="fallbackIcon" alt="" width="36" height="36" />
          <div>
            <div class="catalog-version-name">
              <strong>{{ result.app.name }} {{ result.version.version }}</strong>
              <span v-if="result.version.releases.some((r) => r.beta)" class="status beta"
                >Beta</span
              >
            </div>
            <p>
              {{ [...new Set(result.version.releases.map((r) => r.platform))].join(' · ')
              }}<template v-if="buildsFor(result.version).length">
                ·
                {{
                  buildsFor(result.version)
                    .map((b) => b.build)
                    .join(', ')
                }}</template
              >
            </p>
          </div>
          <span v-if="showVersions" class="catalog-version-date">{{ date(result.released) }}</span>
          <span aria-hidden="true">›</span></RouterLink
        >
      </div>
      <div v-else class="app-grid">
        <RouterLink
          v-for="item in visibleApps"
          :key="item.id"
          class="app-card"
          :to="`/app/${item.id}.html`"
        >
          <img
            :src="item.icon"
            @error="fallbackIcon"
            :alt="`${item.name} icon`"
            width="64"
            height="64"
          />
          <div class="app-card-label">
            <strong>{{ item.name }}</strong>
            <p>
              {{ [...new Set(item.variants.map((v) => displayPlatform(v.platform)))].join(' · ') }}
            </p>
          </div>
        </RouterLink>
      </div>
      <p v-if="showVersions ? !versionRows.length : !visibleApps.length" class="muted">
        No {{ showVersions ? 'versions' : 'apps' }} match your search.
      </p>
    </template>
    <template v-else>
      <nav class="crumbs" aria-label="Breadcrumb">
        <RouterLink to="/app/">Apps</RouterLink><span>/</span
        ><RouterLink v-if="version" :to="`/app/${app.id}.html`">{{ app.name }}</RouterLink
        ><span v-else>{{ app.name }}</span
        ><template v-if="version"
          ><span>/</span><span>{{ version.version }}</span></template
        >
      </nav>
      <header class="app-hero">
        <img
          :src="app.icon"
          @error="fallbackIcon"
          :alt="`${app.name} icon`"
          width="88"
          height="88"
        />
        <div>
          <h1>{{ version ? `${app.name} ${version.version}` : app.name }}</h1>
          <div v-if="version" class="hero-meta">
            <span>{{ summary.date }}</span
            ><span v-if="summary.build" class="dot">·</span
            ><code v-if="summary.build">{{ summary.build }}</code
            ><span
              v-for="status in summary.statuses"
              :key="status"
              class="status"
              :class="{ beta: status !== 'Release' }"
              >{{ status === 'Release' ? 'Stable' : status }}</span
            >
          </div>
          <div v-else class="hero-meta">
            <span
              >{{ app.versions.length }}
              {{ app.versions.length === 1 ? 'version' : 'versions' }}</span
            >
          </div>
        </div>
      </header>
      <div
        v-if="version && headerStores.length && !version.releases.some((r) => r.sources?.length)"
        class="header-stores"
        aria-label="Get the app"
      >
        <a
          v-for="link in headerStores"
          :key="`${link.platform}-${link.edition || ''}-${link.url}`"
          :href="link.url"
          class="download-button store-button"
          rel="noreferrer"
          >{{ link.platform
          }}<template v-if="link.edition"> · {{ edition(link.edition) }}</template>
          <span class="store-destination">{{
            storeLabel(link).replace('View in ', '').replace('View on ', '')
          }}</span
          ><span aria-hidden="true">↗</span></a
        >
      </div>

      <div v-if="!version" class="platform-options">
        <div
          v-for="variant in overviewEntries"
          :key="variant.platform + '-' + (variant.edition || 'standard')"
          class="platform-option platform-option-plain platform-selectable"
          :class="{
            'platform-excluded': excludedPlatforms.includes(variantKey(variant)),
            'platform-static': !canFilterPlatforms,
          }"
          @click="togglePlatform(variant)"
        >
          <span v-if="!canFilterPlatforms" class="platform-name"
            >{{ variant.platform
            }}<template v-if="variant.edition"> · {{ edition(variant.edition) }}</template></span
          ><button
            v-else
            type="button"
            class="platform-name platform-area-toggle"
            :disabled="isLastSelectedPlatform(variant)"
            :aria-pressed="!excludedPlatforms.includes(variantKey(variant))"
            @click.stop="togglePlatform(variant)"
          >
            {{ variant.platform
            }}<template v-if="variant.edition"> · {{ edition(variant.edition) }}</template></button
          ><span v-if="variant.released" class="platform-date"
            >Released: {{ date(variant.released) }}</span
          >
          <div v-if="variant.links?.length" class="plain-store-links">
            <a
              v-for="link in variant.links"
              :key="link.url"
              :href="link.url"
              @click.stop
              :class="{ 'inactive-store': link.active === false }"
              :title="link.active === false ? 'Marked inactive in AppleDB' : undefined"
              rel="noreferrer"
              >{{ storeLabel(link).replace('View in ', '').replace('View on ', '') }}
              <span aria-hidden="true">{{ link.active === false ? '×' : '↗' }}</span></a
            >
          </div>
        </div>
      </div>
      <template v-if="!version">
        <div class="section-title">
          <h2>Version history</h2>
          <span></span
          ><button
            v-if="excludedPlatforms.length"
            type="button"
            class="clear-platform-filter"
            @click="excludedPlatforms = []"
          >
            Select all platforms
          </button>
        </div>
        <p v-if="!historyRows.length" role="status">No versions match the selected platforms.</p>
        <div v-else class="history-table">
          <div class="history-head">
            <span>Version</span><span>Build</span><span>Platforms</span><span>Released</span
            ><span></span>
          </div>
          <RouterLink
            v-for="v in historyRows"
            :key="v.rowKey"
            :to="`/app/${app.id}/${v.key}.html`"
            class="history-row"
          >
            <div class="history-version">
              <strong>{{ v.version }}</strong
              ><span v-if="v.releases.some((r) => r.rc)" class="status beta">RC</span
              ><span v-else-if="v.releases.some((r) => r.beta)" class="status beta">Beta</span>
            </div>
            <div class="history-build">
              <span v-for="item in buildsFor(v)" :key="item.build" class="build-entry"
                ><code>{{ item.build }}</code
                ><small v-if="item.label">{{ item.label }}</small></span
              ><span v-if="!buildsFor(v).length" class="unknown-build">—</span>
            </div>
            <div class="history-platforms">
              <span
                v-for="platform in [...new Set(v.releases.map((r) => r.platform))]"
                :key="platform"
                >{{ platform }}</span
              >
            </div>
            <div class="history-dates">
              <div v-for="entry in datesFor(v)" :key="entry.value" class="history-date">
                <time v-if="entry.value" :datetime="entry.value">{{ date(entry.value) }}</time
                ><span v-else class="unknown-date" title="No release date recorded in AppleDB"
                  >—</span
                ><small v-if="entry.label">{{ entry.label }}</small>
              </div>
            </div>
            <svg
              class="history-chevron"
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="m6 3 5 5-5 5" />
            </svg>
          </RouterLink>
        </div>
      </template>
      <div v-if="version && showReleaseDetails" class="section-title">
        <h2>Release details</h2>
        <span></span>
      </div>
      <section v-if="contextReleases.length" class="release-context">
        <div v-for="(release, index) in contextReleases" :key="index" class="context-card">
          <h3 v-if="new Set(version.releases.map((r) => r.platform)).size > 1 || release.edition">
            {{ release.platform
            }}<template v-if="release.edition"> · {{ edition(release.edition) }}</template>
          </h3>
          <dl class="context-fields">
            <div v-if="release.osMap?.length" class="systems-field">
              <dt>Supported systems</dt>
              <dd class="system-list">
                <span v-for="system in release.osMap" :key="system">{{ system }}</span>
              </dd>
            </div>
            <div v-if="release.safariVersion">
              <dt>Safari version</dt>
              <dd>{{ release.safariVersion }}</dd>
            </div>
            <div v-if="release.build">
              <dt>Build</dt>
              <dd>
                <code>{{ release.build }}</code>
              </dd>
            </div>
            <div v-if="release.buildTrain">
              <dt>Build train</dt>
              <dd>
                {{
                  Array.isArray(release.buildTrain)
                    ? release.buildTrain.join(' · ')
                    : release.buildTrain
                }}
              </dd>
            </div>
            <div v-if="release.released && date(release.released) !== summary.date">
              <dt>Released</dt>
              <dd>{{ date(release.released) }}</dd>
            </div>
            <div v-if="release.internal">
              <dt>Availability</dt>
              <dd>Internal release</dd>
            </div>
          </dl>
          <nav v-if="release.releaseNotes || release.securityNotes" class="release-links">
            <a v-if="release.releaseNotes" :href="noteUrl(release.releaseNotes)">Release notes ↗</a
            ><a
              v-if="release.securityNotes"
              :href="noteUrl(release.securityNotes)"
              :class="{ 'inactive-store': release.securityNotes?.active === false }"
              >Security notes ↗</a
            >
          </nav>
        </div>
      </section>
      <template v-if="bundledReleases.length"
        ><div class="bundled-releases">
          <span class="bundled-label">Included with</span>
          <div class="bundled-rows">
            <div
              v-for="(release, index) in bundledReleases"
              :key="'included-' + index"
              class="bundled-row"
            >
              <span class="bundled-system"
                ><template
                  v-for="(system, systemIndex) in release.osMap?.length
                    ? release.osMap
                    : [release.platform]"
                  :key="system"
                  ><span v-if="systemIndex"> · </span
                  ><template v-if="bundledOSMatches(system, release.released).length"
                    ><a
                      v-for="(os, osIndex) in bundledOSMatches(system, release.released)"
                      :key="os.url"
                      :href="os.url"
                      class="bundled-os-link"
                      >{{ osIndex === 0 ? system + ' ' : ''
                      }}<template v-if="bundledOSMatches(system, release.released).length > 1"
                        >({{
                          decodeURIComponent(os.url.split('/').pop().replace('.html', ''))
                        }})</template
                      >
                      ↗</a
                    ></template
                  ><span v-else>{{ system }}</span></template
                ></span
              ><time
                v-if="
                  release.released && version.releases.some((r) => r.released !== release.released)
                "
                :datetime="release.released"
                >{{ date(release.released) }}</time
              >
            </div>
          </div>
        </div></template
      >
      <template v-if="version && version.releases.some((r) => r.sources?.length)">
        <section
          v-for="(release, index) in directReleases"
          :key="`${release.platform}-${release.edition || ''}-${index}`"
          class="release-group"
        >
          <header v-if="version.releases.length > 1" class="release-heading platform-heading">
            <h3>
              {{ release.platform
              }}<span v-if="release.edition" class="edition">{{ edition(release.edition) }}</span
              ><code v-if="release.build">{{ release.build }}</code
              ><span v-if="summary.status === 'Mixed releases' && release.rc" class="status beta"
                >RC</span
              ><span
                v-else-if="summary.status === 'Mixed releases' && release.beta"
                class="status beta"
                >Beta</span
              >
            </h3>
            <span class="release-meta"
              ><time
                v-if="
                  release.released && version.releases.some((r) => r.released !== release.released)
                "
                >{{ date(release.released) }} · </time
              >{{ release.sources.length }}
              {{ release.sources.length === 1 ? 'file' : 'files' }}</span
            >
          </header>
          <div
            v-if="
              release.buildTrain ||
              release.osMap?.length ||
              release.releaseNotes ||
              release.securityNotes
            "
            class="release-details"
          >
            <div v-if="release.buildTrain">
              <span>Build train</span
              ><code>{{
                Array.isArray(release.buildTrain)
                  ? release.buildTrain.join(', ')
                  : release.buildTrain
              }}</code>
            </div>
            <div v-if="release.osMap?.length">
              <span>Supported systems:</span
              ><strong class="system-list"
                ><span v-for="system in release.osMap" :key="system">{{ system }}</span></strong
              >
            </div>
            <nav
              v-if="release.releaseNotes || release.securityNotes"
              class="release-links"
              aria-label="Release documentation"
            >
              <a v-if="release.releaseNotes" :href="noteUrl(release.releaseNotes)" rel="noreferrer"
                >Release notes ↗</a
              ><a
                v-if="release.securityNotes"
                :href="noteUrl(release.securityNotes)"
                :class="{ 'inactive-store': release.securityNotes?.active === false }"
                rel="noreferrer"
                >Security notes ↗</a
              >
            </nav>
          </div>
          <div v-if="version.releases.length === 1" class="section-title">
            <h2>Downloads</h2>
            <span></span
            ><small
              >{{ release.sources.length }}
              {{ release.sources.length === 1 ? 'file' : 'files' }}</small
            >
          </div>
          <p v-if="sharedSystems(release).length && !release.osMap?.length" class="shared-systems">
            <span>Supported systems:</span>{{ sharedSystems(release).join(' · ') }}
          </p>
          <div class="download-list" v-if="release.sources?.length">
            <article v-for="link in linksFor(release)" :key="link.url" class="download">
              <div class="download-main">
                <div class="file-icon" aria-hidden="true">↗</div>
                <div class="file-info">
                  <strong class="file-name">{{
                    storeLabel(link).replace('View in ', '').replace('View on ', '')
                  }}</strong>
                  <div class="file-meta">
                    <span>{{ release.platform }}</span
                    ><span v-if="release.edition">{{ edition(release.edition) }}</span>
                  </div>
                </div>
                <a
                  :href="link.url"
                  class="download-button file-download store-download"
                  :class="{ 'wide-store': link.type === 'microsoft-store' }"
                  rel="noreferrer"
                  >{{ storeLabel(link) }} <span aria-hidden="true">↗</span></a
                >
              </div>
            </article>
            <article
              v-for="(source, sourceIndex) in release.sources"
              :key="sourceIndex"
              class="download"
            >
              <div class="download-main">
                <div class="file-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4" />
                  </svg>
                </div>
                <div class="file-info">
                  <div class="file-title">
                    <strong class="file-name" :title="file(source)">{{ file(source) }}</strong
                    ><span v-if="source.releaseEdition" class="edition">{{
                      edition(source.releaseEdition)
                    }}</span>
                  </div>
                  <div
                    class="file-release-info"
                    v-if="
                      source.fileReleased ||
                      source.fileBuild ||
                      source.fileBuildTrain ||
                      source.fileReleaseNotes ||
                      source.fileSecurityNotes
                    "
                  >
                    <span v-if="source.fileReleased">Released: {{ date(source.fileReleased) }}</span
                    ><span v-if="source.fileBuild"
                      >Build: <code>{{ source.fileBuild }}</code></span
                    ><span v-if="source.fileBuildTrain"
                      >Build train:
                      {{
                        Array.isArray(source.fileBuildTrain)
                          ? source.fileBuildTrain.join(' · ')
                          : source.fileBuildTrain
                      }}</span
                    ><a v-if="source.fileReleaseNotes" :href="noteUrl(source.fileReleaseNotes)"
                      >Release notes {{ source.fileReleaseNotes?.active === false ? '×' : '↗' }}</a
                    ><a
                      v-if="source.fileSecurityNotes"
                      :href="noteUrl(source.fileSecurityNotes)"
                      :class="{ 'inactive-store': source.fileSecurityNotes?.active === false }"
                      >Security notes ↗</a
                    >
                  </div>
                  <div class="file-meta">
                    <span>{{ source.type.toUpperCase() }}</span
                    ><span v-if="downloadVariant(source)">{{ downloadVariant(source) }}</span
                    ><span v-if="source.arch?.length">{{ arch(source.arch) }}</span
                    ><span v-if="source.size">{{ size(source.size) }}</span
                    ><span
                      v-if="
                        source.osMap?.length &&
                        !sharedSystems(release).length &&
                        source.osMap.join() !== release.osMap?.join()
                      "
                      >{{ source.osMap.join(' · ') }}</span
                    >
                  </div>
                </div>
                <div class="file-actions">
                  <button
                    v-if="source.hashes"
                    class="checksum-toggle"
                    :aria-expanded="!!expandedHashes[source.links[0].url]"
                    @click="
                      expandedHashes[source.links[0].url] = !expandedHashes[source.links[0].url]
                    "
                  >
                    <svg
                      class="checksum-chevron"
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      aria-hidden="true"
                    >
                      <path d="m6 3 5 5-5 5" /></svg
                    >Checksums</button
                  ><a
                    :href="downloadLink(source).url"
                    class="download-button file-download"
                    :class="{ 'inactive-store': !hasActiveDownload(source) }"
                    rel="noreferrer"
                    >{{ hasActiveDownload(source) ? 'Download' : 'Inactive link' }}
                    <span aria-hidden="true">{{ hasActiveDownload(source) ? '↓' : '×' }}</span></a
                  >
                </div>
              </div>
              <div v-if="source.hashes" class="download-footer">
                <details class="hashes" :open="!!expandedHashes[source.links[0].url]">
                  <summary>
                    <svg
                      class="checksum-chevron"
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      aria-hidden="true"
                    >
                      <path d="m6 3 5 5-5 5" /></svg
                    >Checksums
                  </summary>
                  <div class="hash-panel">
                    <div v-for="(value, type) in source.hashes" :key="type" class="hash-row">
                      <label>{{ type.replace('sha2-', 'SHA-').toUpperCase() }}</label
                      ><code>{{ value }}</code
                      ><button @click="copyHash(value)" :aria-label="`Copy ${type} checksum`">
                        {{ copied === value ? 'Copied' : 'Copy' }}
                      </button>
                    </div>
                    <small v-if="source.size">{{ source.size.toLocaleString() }} bytes</small>
                  </div>
                </details>
              </div>
            </article>
          </div>
          <div v-if="release.sdks?.length" class="sdk-section">
            <div class="section-title">
              <h2>Included SDKs</h2>
              <span></span>
            </div>
            <div class="sdk-grid sdk-head">
              <span>Platform</span><span>Version</span><span>Build</span>
            </div>
            <a
              v-for="sdk in release.sdks"
              :key="`${sdk.osStr}-${sdk.build}`"
              :href="sdkUrl(sdk)"
              class="sdk-grid sdk-link"
              ><strong class="sdk-platform"
                ><img
                  :src="`https://img.appledb.dev/device@main/${encodeURIComponent(sdk.osStr + ' SDK')}/0.png`"
                  alt=""
                  width="24"
                  height="24"
                  loading="lazy"
                  @error="$event.target.style.visibility = 'hidden'"
                />{{ sdk.osStr }}</strong
              ><span
                >{{ sdk.version }}<small v-if="sdk.beta"> Beta</small
                ><small v-if="sdk.rc"> RC</small></span
              ><code>{{ sdk.build || '—' }} <span aria-hidden="true">↗</span></code></a
            >
            <details v-if="release.sdks.some((s) => s.buildId)" class="sdk-identifiers">
              <summary>
                <svg
                  class="sdk-id-chevron"
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="m6 3 5 5-5 5" /></svg
                >SDK build identifiers
              </summary>
              <div class="sdk-id-panel">
                <div v-for="sdk in release.sdks.filter((s) => s.buildId)" :key="sdk.buildId">
                  <strong>{{ sdk.osStr }}</strong
                  ><code>{{ sdk.buildId }}</code
                  ><button
                    @click="copyHash(sdk.buildId)"
                    :aria-label="`Copy ${sdk.osStr} SDK build identifier`"
                  >
                    {{ copied === sdk.buildId ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.app-catalog {
  --line: color-mix(in srgb, var(--c-text) 28%, var(--c-bg));
  --soft: var(--c-bg-light, #f5f6f8);
  max-width: 920px;
  margin: 0 auto;
  padding: 12px 0 60px;
}
.app-catalog h1 {
  padding: 0;
  font-size: 2.15rem;
  line-height: 1.2;
  margin: 0 0 12px;
  letter-spacing: -0.035em;
}
.app-catalog h2,
.app-catalog h3 {
  border: 0;
  padding: 0;
  margin: 0;
}
.app-card p,
.app-card span,
.crumbs,
.file-info p,
.hero-meta,
.muted,
.release-meta {
  color: var(--c-text-light);
}
.crumbs {
  gap: 12px;
  font-size: 0.85rem;
  margin-bottom: 28px;
}
.app-hero,
.crumbs,
.hero-meta {
  display: flex;
  align-items: center;
}
.app-hero {
  gap: 24px;
  margin: 0 0 42px;
}
.app-hero img {
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 5px 8px #0002);
}
.hero-meta {
  gap: 10px;
  font-size: 0.95rem;
  flex-wrap: wrap;
}
.hero-meta code {
  padding: 0;
  background: none;
  color: inherit;
  font-size: 0.9em;
}
.status {
  display: inline-flex;
  border: 1px solid #529ed0;
  color: #529ed0;
  border-radius: 20px;
  padding: 2px 9px;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.6;
}
.status.beta {
  color: #b68b30;
  border-color: #b68b30;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 26px 0 20px;
}
.section-title h2 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-light);
  white-space: nowrap;
}
.section-title > span {
  height: 1px;
  flex: 1;
  background: var(--line);
}
.section-title small {
  font-size: 0.75rem;
  color: var(--c-text-light);
}
.release-group {
  margin-bottom: 28px;
}
.release-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin: 0 0 12px;
}
.release-heading h3 {
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.edition {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--c-text-light);
  border: 1px solid var(--line);
  padding: 3px 7px;
  border-radius: 5px;
}
.release-meta {
  font-size: 0.75rem;
  white-space: nowrap;
  display: flex;
  gap: 6px;
  align-items: center;
}
.download-list {
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
}
.download + .download {
  border-top: 1px solid var(--line);
}
.download-main {
  display: flex;
  gap: 16px;
  padding: 18px 20px;
}
.file-icon {
  width: 38px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: var(--c-brand);
  background: var(--soft);
  flex-shrink: 0;
}
.file-info {
  flex: 1;
  flex-basis: 160px;
}
.file-info strong {
  font-size: 0.95rem;
}
.file-info p {
  font-size: 0.76rem;
  margin: 3px 0;
  overflow-wrap: anywhere;
}
.download-button {
  border: 1px solid var(--c-brand);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.8rem;
  white-space: nowrap;
  background: color-mix(in srgb, var(--c-brand) 7%, transparent);
}
.download-button span {
  margin-left: 9px;
}
.download-button:hover {
  background: var(--c-brand);
  color: var(--c-bg);
  text-decoration: none;
}
.download-footer {
  padding: 10px 20px 12px 74px;
  border-top: 1px solid var(--line);
  background: var(--soft);
  font-size: 0.72rem;
}
.hashes summary {
  cursor: pointer;
  color: var(--c-brand);
  width: fit-content;
  list-style-position: inside;
}
.hash-panel {
  padding-top: 12px;
}
.hash-row {
  display: grid;
  grid-template-columns: 65px minmax(0, 1fr) 50px;
  gap: 8px;
  align-items: start;
  margin-bottom: 10px;
}
.hash-row label {
  font-size: 0.65rem;
  line-height: 2;
}
.hash-row code {
  word-break: break-all;
  font-size: 0.7rem;
  background: none;
  padding: 0;
  line-height: 1.8;
}
.hash-row button {
  font-size: 0.67rem;
  border: 1px solid var(--line);
  background: var(--c-bg);
  color: var(--c-text);
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
}
.no-download {
  border: 1px solid var(--line);
  padding: 20px;
  border-radius: 8px;
  color: var(--c-text-light);
  font-size: 0.9rem;
}
.catalog-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  margin-bottom: 8px;
}
.count,
.eyebrow {
  color: var(--c-text-light);
}
.count {
  font-size: 0.8rem;
}
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 10px 14px;
  margin: 0 0 24px;
  background: var(--soft);
}
.search input {
  border: 0;
  outline: 0;
  background: none;
  color: var(--c-text);
  font: inherit;
  width: 100%;
  font-size: 0.9rem;
}
.app-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.app-card {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  align-items: center;
  aspect-ratio: 1;
  min-width: 0;
  text-align: center;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 9px;
  color: var(--c-text);
  transition: border-color 0.15s;
}
.app-card:hover {
  border-color: var(--c-brand);
  text-decoration: none;
}
.app-card img {
  object-fit: contain;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
}
.app-card-label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}
.app-card-label strong {
  display: block;
  font-size: 0.95rem;
  margin: 0;
  padding: 0;
  line-height: 1.3;
}
.app-card-label p {
  margin: 0 !important;
  padding: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  min-height: 2.7em;
}
.app-card span {
  font-size: 0.72rem;
}
.app-card .arrow {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 1.3rem;
}
a:focus-visible,
button:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 3px;
}
@media (max-width: 680px) {
  .app-catalog {
    padding-top: 4px;
  }
  .app-hero {
    gap: 16px;
  }
  .app-hero img {
    width: 64px;
    height: 64px;
  }
  .app-catalog h1 {
    padding: 0;
    font-size: 1.55rem;
  }
  .release-heading {
    align-items: start;
    flex-direction: column;
    gap: 6px;
  }
  .download-main {
    padding: 15px 12px;
  }
  .file-icon {
    display: none;
  }
  .download-footer {
    padding: 10px 12px;
  }
  .app-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .app-card {
    padding: 10px;
    gap: 10px;
  }
  .hero-meta {
    font-size: 0.8rem;
  }
  .crumbs {
    font-size: 0.75rem;
    gap: 8px;
  }
  .download-button {
    padding: 7px 9px;
  }
  .hash-row {
    grid-template-columns: 50px minmax(0, 1fr) 45px;
  }
}
@media (max-width: 480px) {
  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 380px) {
  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.app-catalog .search:focus-within {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 1px var(--c-brand);
}
.app-catalog .search input:focus,
.app-catalog .search input:focus-visible {
  outline: none;
  box-shadow: none;
}
.store-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
}
.store-button span {
  margin: 0;
}
.history-head,
.history-row {
  display: grid;
  grid-template-columns:
    minmax(60px, 0.8fr) minmax(70px, 1fr) minmax(100px, 1.2fr)
    minmax(105px, 1fr) 16px;
  align-items: center;
  gap: 16px;
}
.history-head {
  color: var(--c-text-light);
  font-size: 0.7rem;
  padding: 0 12px 10px;
}
.history-head span:nth-child(4) {
  text-align: right;
}
.history-row {
  padding: 16px 12px;
  border-bottom: 1px solid var(--line);
  color: var(--c-text);
  border-radius: 4px;
  font-size: 0.9rem;
}
.history-row:hover {
  background: var(--soft);
  text-decoration: none;
}
.history-platforms {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.history-platforms span {
  font-size: 0.68rem;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--soft);
}
.history-build,
.history-chevron,
.history-platforms span,
.history-row time {
  color: var(--c-text-light);
}
.history-row time {
  text-align: right;
  font-size: 0.78rem;
}
@media (max-width: 540px) {
  .history-head {
    display: none;
  }
  .history-row {
    grid-template-columns: 1fr auto 16px;
    gap: 8px;
    padding: 14px 4px;
  }
  .history-row strong {
    grid-column: 1;
    grid-row: 1;
  }
  .history-platforms {
    grid-column: 1;
    grid-row: 2;
  }
  .history-row time {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
  .history-chevron {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
}
.app-catalog .app-hero:has(+ .header-stores) {
  margin-bottom: 20px;
}
.header-stores {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 32px;
}
.header-stores .store-button {
  gap: 9px;
}
.store-destination {
  font-weight: 400;
  opacity: 0.8;
  font-size: 0.75rem;
}
.history-build {
  font-family: var(--font-family-code, monospace);
  font-size: 0.75rem;
  overflow-wrap: anywhere;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: inherit;
}
@media (max-width: 540px) {
  .history-build {
    grid-column: 1;
    grid-row: 2;
    font-size: 0.7rem;
  }
  .history-platforms {
    grid-row: 3;
  }
  .history-chevron,
  .history-row time {
    grid-row: 1 / span 3;
  }
}
.build-entry {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}
.build-entry code {
  background: none;
  padding: 0;
  font-size: 0.78rem;
  color: var(--c-text);
}
.build-entry small {
  font-family: inherit;
  font-size: 0.65rem;
}
.build-entry small,
.unknown-build {
  color: var(--c-text-light);
}
.release-details {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 4px 0 20px;
  font-size: 0.8rem;
}
.release-details > div {
  gap: 16px;
  flex-wrap: wrap;
}
.release-details > div > span {
  color: var(--c-text-light);
  min-width: 115px;
}
.release-details strong {
  font-weight: 400;
}
.release-details code {
  background: none;
  padding: 0;
}
.release-links {
  display: flex;
  margin-top: 3px;
}
.sdk-section {
  margin-top: 28px;
}
.sdk-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--line);
  font-size: 0.8rem;
}
.sdk-grid strong {
  font-weight: 500;
}
.sdk-grid code,
.sdk-identifiers code {
  background: none;
  padding: 0;
}
.sdk-grid code,
.sdk-grid > span,
.sdk-platform {
  line-height: 1.5;
}
.sdk-head {
  font-size: 0.7rem;
  color: var(--c-text-light);
}
.sdk-identifiers {
  margin-top: 14px;
  font-size: 0.75rem;
}
.sdk-identifiers summary {
  cursor: pointer;
  color: var(--c-brand);
}
.sdk-identifiers > div {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 0;
}
.sdk-identifiers code {
  overflow-wrap: anywhere;
}
.sdk-link {
  color: var(--c-text);
}
.sdk-link:hover {
  background: var(--soft);
  text-decoration: none;
  color: var(--c-brand);
}
.sdk-link code span {
  float: right;
  color: var(--c-text-light);
}
.sdk-platform {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sdk-platform img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}
.release-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 28px;
  margin: 0 0 22px;
}
.release-details > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.release-details > div > span {
  font-size: 0.72rem;
  min-width: 0;
}
.release-details code,
.release-details strong {
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
.release-links {
  grid-column: 1/-1;
  gap: 20px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 0.78rem;
}
.download-main {
  padding: 14px 18px;
  flex-wrap: wrap;
}
.file-icon {
  width: 32px;
  height: 36px;
  border: 0;
  background: none;
}
.file-info .file-name {
  font-size: 0.85rem;
}
.download-footer {
  padding: 9px 18px 10px 62px;
  background: transparent;
  border-top: 0;
}
.app-catalog .app-hero {
  margin-bottom: 28px;
}
.header-stores {
  margin-bottom: 26px;
}
@media (max-width: 540px) {
  .release-details {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .download-footer {
    padding-left: 12px;
  }
  .download-main {
    padding: 12px;
  }
  .release-links {
    gap: 14px;
  }
  .file-download {
    margin-left: auto;
  }
  .history-version {
    grid-column: 1;
    grid-row: 1;
  }
}
.file-download {
  flex-shrink: 0;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 124px;
  height: 34px;
}
.history-version {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
}
.file-info .file-name,
.history-version strong,
.release-search-row p {
  overflow-wrap: anywhere;
}
.history-version .status {
  font-weight: 400;
  font-size: 0.58rem;
}
.download-footer {
  padding-top: 0;
  padding-bottom: 12px;
}
.hashes summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  color: var(--c-text-light);
  font-size: 0.7rem;
  line-height: 1.5;
  padding: 4px 8px;
  margin-left: -8px;
  border-radius: 4px;
}
.hashes summary::-webkit-details-marker {
  display: none;
}
.hashes summary:hover {
  color: var(--c-text);
  background: var(--soft);
}
.checksum-chevron {
  transition: transform 0.15s;
  flex-shrink: 0;
}
.checksum-toggle[aria-expanded='true'] .checksum-chevron,
.hashes[open] .checksum-chevron,
.sdk-identifiers[open] .sdk-id-chevron {
  transform: rotate(90deg);
}
.hash-panel {
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--soft);
}
.hash-row {
  grid-template-columns: 65px minmax(0, 1fr) 56px;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 8px 0;
}
.hash-row + .hash-row {
  border-top: 1px solid var(--line);
}
.hash-row label {
  font-weight: 600;
  color: var(--c-text-light);
  line-height: 1.5;
}
.hash-row code {
  font-size: 0.72rem;
  line-height: 1.6;
  user-select: all;
}
.hash-row button {
  padding: 5px 8px;
  border-radius: 5px;
}
.hash-row button:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.hash-panel > small {
  display: block;
  color: var(--c-text-light);
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  font-size: 0.65rem;
}
@media (max-width: 540px) {
  .hash-panel {
    padding: 8px 10px;
  }
  .hash-row {
    grid-template-columns: 1fr auto;
    gap: 6px;
  }
  .hash-row code {
    grid-column: 1/-1;
    grid-row: 2;
  }
  .hash-row button {
    grid-column: 2;
    grid-row: 1;
  }
}
.download-footer:has(.hashes) {
  padding: 0 18px;
}
.hashes summary {
  display: none;
}
.hashes[open] {
  padding-bottom: 14px;
}
.hash-panel {
  margin-top: 0;
}
.checksum-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--soft);
  font: inherit;
  font-size: 0.65rem;
  line-height: 1.5;
  color: var(--c-text-light);
  cursor: pointer;
}
.checksum-toggle:hover,
.checksum-toggle[aria-expanded='true'] {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.file-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}
.file-actions .checksum-toggle {
  height: 34px;
  box-sizing: border-box;
  padding: 0 10px;
  font-size: 0.7rem;
}
@media (max-width: 540px) {
  .file-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 100%;
  }
  .file-actions .file-download {
    margin-left: 0;
  }
  .download-footer:has(.hashes) {
    padding: 0 12px;
  }
}
.file-actions .checksum-toggle {
  height: 28px;
  padding: 0 8px;
  font-size: 0.65rem;
  background: transparent;
  border-color: color-mix(in srgb, var(--c-text) 16%, var(--c-bg));
  color: var(--c-text-light);
}
.file-actions .checksum-toggle:hover {
  border-color: var(--line);
  color: var(--c-text);
  background: var(--soft);
}
.platform-heading {
  margin-bottom: 8px;
}
.platform-heading h3 {
  gap: 12px;
}
.platform-heading code {
  background: none;
  padding: 0;
  color: var(--c-text-light);
  font-size: 0.75rem;
  font-weight: 400;
}
.shared-systems {
  display: flex;
  gap: 8px 14px;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--c-text-light);
  margin: 0 0 14px !important;
  line-height: 1.6;
}
.shared-systems > span {
  font-weight: 500;
}
.release-group + .release-group {
  margin-top: 28px;
}
.download-main {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.file-info {
  min-width: 0;
}
.file-info .file-name {
  display: block;
}
.download-main > .file-download,
.file-actions {
  grid-column: 3;
  justify-self: end;
}
@media (max-width: 680px) {
  .download-main {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
  }
  .download-main > .file-download,
  .file-actions {
    grid-column: 2;
  }
}
@media (max-width: 480px) {
  .download-main {
    grid-template-columns: minmax(0, 1fr);
  }
  .download-main > .file-download,
  .file-actions {
    grid-column: 1;
    justify-self: end;
  }
}
.download-list:has(.wide-store) .file-download {
  width: 148px;
}
.file-download.store-download {
  font-size: 0.75rem;
}
.sdk-identifiers summary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  list-style: none;
  color: var(--c-text-light);
  font-size: 0.72rem;
  padding: 5px 0;
}
.sdk-identifiers summary::-webkit-details-marker {
  display: none;
}
.sdk-identifiers summary:hover {
  color: var(--c-brand);
}
.sdk-id-chevron {
  transition: transform 0.15s;
}
.sdk-identifiers > .sdk-id-panel {
  display: block;
  padding: 4px 14px;
  margin-top: 8px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--soft);
}
.sdk-id-panel > div {
  display: grid;
  grid-template-columns: 85px minmax(0, 1fr) 56px;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}
.sdk-id-panel > div + div {
  border-top: 1px solid var(--line);
}
.sdk-id-panel strong {
  font-weight: 500;
  font-size: 0.75rem;
}
.sdk-id-panel code {
  font-size: 0.7rem;
  line-height: 1.6;
  user-select: all;
}
.sdk-id-panel button {
  border: 1px solid var(--line);
  border-radius: 5px;
  background: transparent;
  color: var(--c-text-light);
  font-size: 0.65rem;
  padding: 5px 8px;
  cursor: pointer;
}
.sdk-id-panel button:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
@media (max-width: 540px) {
  .sdk-id-panel > div {
    grid-template-columns: minmax(0, 1fr) 56px;
    gap: 6px;
  }
  .sdk-id-panel code {
    grid-column: 1/-1;
    grid-row: 2;
  }
  .sdk-id-panel button {
    grid-column: 2;
    grid-row: 1;
  }
  .history-dates {
    grid-column: 2;
    grid-row: 1 / span 3;
  }
  .history-date time {
    grid-column: auto;
    grid-row: auto;
  }
}
.release-search-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--line);
  color: var(--c-text);
}
.release-search-row:hover {
  background: var(--soft);
  text-decoration: none;
}
.release-search-row img {
  object-fit: contain;
  flex-shrink: 0;
}
.release-search-row > div {
  flex: 1;
  min-width: 0;
}
.release-search-row strong {
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.release-search-row p {
  margin: 4px 0 0;
  font-size: 0.75rem;
}
.release-search-row p,
.release-search-row > span:last-child,
.search-icon {
  color: var(--c-text-light);
}
.search-icon {
  display: block;
  flex: 0 0 18px;
}
.catalog-heading {
  margin-bottom: 18px;
}
.catalog-heading .muted {
  margin-bottom: 0;
}
.plain-store-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.72rem;
  margin-top: 5px;
  min-height: 30px;
}
.plain-store-links a {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  border: 1px solid var(--c-brand);
  border-radius: 5px;
  background: color-mix(in srgb, var(--c-brand) 7%, transparent);
  font-size: 0.72rem;
  line-height: 1.4;
}
.plain-store-links a:hover {
  background: var(--c-brand);
  color: var(--c-bg);
  text-decoration: none;
}
.plain-store-links a.inactive-store {
  border-color: #d65b64;
  color: #d65b64;
  background: color-mix(in srgb, #d65b64 7%, transparent);
}
.plain-store-links a.inactive-store:hover {
  background: color-mix(in srgb, #d65b64 15%, transparent);
  color: #d65b64;
}
.inactive-store span {
  font-size: 1rem;
  line-height: 1;
}
.history-dates {
  gap: 8px;
  text-align: right;
  min-width: 0;
}
.history-date,
.history-dates {
  display: flex;
  flex-direction: column;
}
.history-date {
  gap: 3px;
}
.history-date small {
  font-size: 0.65rem;
  color: var(--c-text-light);
  line-height: 1.3;
}
.history-date time {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.unknown-date {
  font-size: 0.78rem;
  color: var(--c-text-light);
}
.file-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.file-title .edition {
  font-size: 0.62rem;
}
.release-group .download-list {
  border: 0;
  border-radius: 0;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.release-group .download {
  border: 1px solid var(--line);
  border-radius: 9px;
  overflow: hidden;
}
.file-release-info {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 14px;
  margin: 6px 0;
  color: var(--c-text-light);
  font-size: 0.73rem;
}
.file-release-info code {
  font-size: inherit;
}
.app-catalog a.inactive-store {
  color: #d65b64;
}
.app-catalog a.download-button.inactive-store {
  border-color: #d65b64;
  background: color-mix(in srgb, #d65b64 7%, transparent);
}
.app-catalog a.download-button.inactive-store:hover {
  color: #d65b64;
  background: color-mix(in srgb, #d65b64 15%, transparent);
}
.release-context {
  margin-bottom: 26px;
}
.release-details + .section-title {
  margin-top: 16px;
}

/* Platform overview: compact columns, shared multi-selection behavior. */
.platform-options {
  display: grid;
  grid-template-columns: repeat(4, max-content);
  align-items: start;
  gap: 18px 20px;
  width: fit-content;
  max-width: 100%;
  margin: 0 0 28px;
}
.platform-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
  padding-left: 20px;
  border-left: 1px solid var(--line);
}
.platform-option:nth-child(4n + 1) {
  padding-left: 0;
  border-left: 0;
}
.platform-name,
.platform-area-toggle {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--c-text);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
}
.platform-date {
  font-size: 0.7rem;
  color: var(--c-text-light);
}
.platform-selectable,
.platform-area-toggle {
  cursor: pointer;
}
.platform-selectable:hover .platform-area-toggle {
  color: var(--c-brand);
}
.platform-excluded .platform-area-toggle,
.platform-excluded .platform-date {
  opacity: 0.45;
}
.platform-static,
.platform-selectable:has(.platform-area-toggle:disabled),
.platform-area-toggle:disabled {
  cursor: default;
}
.platform-area-toggle:disabled {
  opacity: 1;
}
.platform-selectable:hover .platform-area-toggle:disabled {
  color: var(--c-text);
}
.clear-platform-filter {
  border: 0;
  background: none;
  color: var(--c-brand);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 4px;
}
@media (max-width: 900px) {
  .platform-options {
    grid-template-columns: repeat(3, max-content);
  }
  .platform-option:nth-child(n) {
    padding-left: 20px;
    border-left: 1px solid var(--line);
  }
  .platform-option:nth-child(3n + 1) {
    padding-left: 0;
    border-left: 0;
  }
}
@media (max-width: 680px) {
  .platform-options {
    grid-template-columns: repeat(2, minmax(0, max-content));
    column-gap: 16px;
  }
  .platform-option:nth-child(n) {
    padding-left: 16px;
    border-left: 1px solid var(--line);
  }
  .platform-option:nth-child(2n + 1) {
    padding-left: 0;
    border-left: 0;
  }
}
@media (max-width: 480px) {
  .platform-date {
    font-size: 0.65rem;
  }
}
@media (max-width: 360px) {
  .platform-options {
    grid-template-columns: 1fr;
  }
  .platform-option:nth-child(n) {
    padding-left: 0;
    border-left: 0;
  }
}
/* Shared file metadata and supported systems. */
.file-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 4px;
  color: var(--c-text-light);
  font-size: 0.68rem;
  letter-spacing: 0.03em;
}
.file-meta > span {
  white-space: nowrap;
}
.file-meta > span + span::before {
  content: '·';
  display: inline-block;
  margin: 0 6px;
  color: var(--c-text-light);
}
.system-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 7px 24px;
  max-width: 680px;
  line-height: 1.5;
}
.system-list > span {
  display: block;
  white-space: normal;
}
.context-card {
  padding: 0 0 12px;
  border-bottom: 1px solid var(--line);
}
.context-card:last-child {
  border-bottom: 0;
}
.context-card h3 {
  font-size: 0.9rem;
  margin-bottom: 12px;
}
.context-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
  margin: 0;
}
.context-fields dt {
  font-size: 0.72rem;
  color: var(--c-text-light);
  margin-bottom: 3px;
}
.context-fields dd {
  font-size: 0.85rem;
  margin: 0;
  overflow-wrap: anywhere;
}
.context-fields > .systems-field {
  grid-column: 1 / -1;
}
.context-fields .system-list {
  margin-top: 7px;
}
.context-card .release-links {
  margin-top: 12px;
}
/* Bundled OS references retain recorded versions and optional dates. */
.bundled-releases {
  display: flex;
  align-items: baseline;
  gap: 20px;
  margin: -4px 0 26px;
  font-size: 0.8rem;
  line-height: 1.6;
}
.bundled-label {
  color: var(--c-text-light);
  white-space: nowrap;
}
.bundled-rows {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.bundled-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  align-items: baseline;
}
.bundled-system {
  color: var(--c-text);
}
.bundled-row time {
  font-size: inherit;
  color: var(--c-text-light);
  white-space: nowrap;
}
.bundled-row time::before {
  content: '·';
  margin-right: 10px;
  color: var(--c-text-light);
}
@media (max-width: 540px) {
  .context-fields {
    grid-template-columns: 1fr;
  }
  .system-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px 16px;
  }
  .bundled-releases {
    display: block;
  }
  .bundled-label {
    display: block;
    margin-bottom: 6px;
  }
}
.catalog-view-controls {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin: 0 0 24px;
}
.catalog-view-controls .search {
  flex: 1;
  min-width: 0;
  margin: 0;
}
.catalog-view-controls .search input {
  min-width: 0;
}
.catalog-version-count {
  display: block;
  margin: -8px 0 16px;
}
.catalog-version-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.catalog-version-name .status {
  flex-shrink: 0;
}
.catalog-view-toggle {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--soft);
  color: var(--c-text);
  font: inherit;
  cursor: pointer;
}
.catalog-view-toggle[aria-pressed='true'] {
  border-color: var(--c-brand);
  color: var(--c-brand);
}
.catalog-version-date {
  font-size: 0.75rem;
  color: var(--c-text-light);
  white-space: nowrap;
}
@media (max-width: 520px) {
  .release-search-row {
    flex-wrap: wrap;
  }
  .catalog-version-date {
    margin-left: 50px;
  }
}
</style>
