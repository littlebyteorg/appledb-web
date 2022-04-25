<script setup lang="ts">
import PageMeta from '@theme/PageMeta.vue'
import PageNav from '@theme/PageNav.vue'

import firmwareVersion from './firmwareVersion.vue'
import jailbreak from './jailbreak.vue'
import device from './device.vue'
import deviceList from './deviceList.vue'
import deviceGroupList from './deviceGroupList.vue'
import deviceGroup from './deviceGroup.vue'

import { usePageData, usePageFrontmatter } from '@vuepress/client'
import type { DefaultThemePageFrontmatter } from '@vuepress/theme-default/lib/shared'
const frontmatter = usePageFrontmatter<DefaultThemePageFrontmatter>()

const pageTitle = frontmatter.value.title
const chartType = frontmatter.value.chartType
</script>

<template>
  <main class="page">
    <slot name="top" />

    <div :class="(chartType == 'device' || chartType == 'deviceGroup') ? 'home' : 'theme-default-content'">
      <h1>{{ pageTitle }}</h1>

      <firmwareVersion v-if="chartType == 'firmware'"/>
      <jailbreak v-else-if="chartType == 'jailbreak'"/>
      <device v-else-if="chartType == 'device'"/>
      <deviceList v-else-if="chartType == 'deviceList'"/>
      <deviceGroupList v-else-if="chartType == 'deviceGroupList'"/>
      <deviceGroup v-else-if="chartType == 'deviceGroup'"/>

      <p>AppleDB is not affiliated with Apple Inc.</p>
    </div>

    <PageMeta />

    <PageNav />

    <slot name="bottom" />
  </main>
</template>
