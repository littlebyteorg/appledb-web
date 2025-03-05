<template>
  <main class="page">
    <div class="theme-default-content">
      <pageTitle v-if="!hideTitle" :content="titleContent"/>
      <div v-if="!noAds && adUnits && adUnits.length > 0" :id="`waldo-tag-${adUnits[0]}`"></div>
      <template v-for="section in sections" :key="section.title">
        <template v-if="section.title">
          <h5 v-if="section.class.includes('smallTitle')">{{ section.title }}</h5>
          <h2 v-else>{{ section.title }}</h2>
        </template>
        <vueSection :section="section"/>
      </template>
      <template v-if="frontmatter">
        <device :frontmatter="frontmatter"/>
      </template>
      <div v-if="!noAds & adUnits && adUnits.length > 1" :id="`waldo-tag-${adUnits[1]}`"></div>
    </div>
  </main>
</template>

<script>
import { useThemeLocaleData } from '@vuepress/theme-default/lib/client/composables'

export default {
  data() {
    return {
      titleContent: {},
      sections: [],
      hideTitle: false,
      noAds: true,
      adUnits: useThemeLocaleData().value.adUnits,
      frontmatter: null,
    }
  },
  async created() {
    const routeName = this.$route.name
    const routeParams = Object.keys(this.$route.params).map(x => this.$route.params[x])
    fetch(`/pageData/${routeName}/${routeParams.join(';')}.json`.replace(/\.html/g,''), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )
    .then((response) => response.text())
    .then((response) => JSON.parse(response))
    .then((data) => {
      if (data.noAds) this.noAds = data.noAds
      if (data.frontmatter) {
        this.titleContent = {
          header: data.frontmatter.title
        }
        this.sections = []
        this.frontmatter = data.frontmatter
        if (this.frontmatter.hideTitle) this.hideTitle = this.frontmatter.hideTitle
      } else {
        this.titleContent = data.title
        this.sections = data.sections
      }
      document.title = this.titleContent.header + ' | AppleDB'
    })
  },
  mounted() {
    document.title = this.titleContent.header + ' | AppleDB' // Yes this needs to be done twice idk why
  },
  methods: {
    getPageData() {
      const routeName = this.$route.name
      const routeParams = Object.keys(this.$route.params).map(x => this.$route.params[x])
      
      return fetch(`https://api.appledb.dev/appledb-web/pageData/${routeName}/${routeParams.join(';')}.json`.replace(/\.html/g,''), {
          method: 'GET',
	        headers: { 'Content-Type': 'application/json' }
        }
      )
      .then((response) => response.json());
    }
  }
}
</script>