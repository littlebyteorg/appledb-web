<template>
  <main class="page">
    <slot name="top" />

    <div :class="(chartType == 'device') ? 'home' : 'theme-default-content'">
      <h1>{{ pageTitle }}</h1>
      <div class="custom-container tip" v-if="discordNoticeText" v-html="discordNoticeText"/>
      
      <firmwareVersion v-if="chartType == 'firmware'"/>
      <jailbreak v-else-if="chartType == 'jailbreak'"/>
      <device v-else-if="chartType == 'device'"/>
      <deviceList v-else-if="chartType == 'deviceList'"/>

      <p>AppleDB is not affiliated with Apple Inc.</p>
    </div>

    <slot name="bottom" />
  </main>
</template>

<script setup lang="ts">
import {
  usePageFrontmatter,
  useSiteLocaleData,
} from '@vuepress/client'
import { computed } from 'vue'
import type { DefaultThemeHomePageFrontmatter } from '../vuepress-theme/lib/shared'
const frontmatter = usePageFrontmatter<DefaultThemeHomePageFrontmatter>()
import { useThemeLocaleData } from '../vuepress-theme/lib/client/composables'

import firmwareVersion from './firmwareVersion.vue'
import jailbreak from './jailbreak.vue'
import device from './device.vue'
import deviceList from './deviceList.vue'

const themeLocale = useThemeLocaleData()

const chartType = computed(() => { return frontmatter.value.chartType })

const discordNoticeText = computed(() => {
  var discordNoticeText = frontmatter.value.discordNoticeText || themeLocale.value.discordNoticeText
  if (!discordNoticeText) return
  
  return '<p>' + discordNoticeText + '</p>'
})

const adTagOne = computed(() => {
  var adTagOne = themeLocale.value.adTagOne
  if (!adTagOne) return
  
  return adTagOne
})

const adTagTwo = computed(() => {
  var adTagTwo = themeLocale.value.adTagTwo
  if (!adTagTwo) return
  
  return adTagTwo
})

const adsBool = computed(() => {
  if (!frontmatter.value.ads) return
  
  return frontmatter.value.ads
})

const pageTitle = computed(() => {
  if (!frontmatter.value.title) return
  
  return frontmatter.value.title
})
</script>
