<script setup lang="ts">
import Home from '@theme/Home.vue'
import Navbar from '@theme/Navbar.vue'
import Page from '../components/Page.vue'
import Sidebar from '@theme/Sidebar.vue'
import { usePageData, usePageFrontmatter } from '@vuepress/client'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { DefaultThemePageFrontmatter } from '@vuepress/theme-default/lib/shared'
import {
  useScrollPromise,
  useSidebarItems,
  useThemeLocaleData,
} from '@vuepress/theme-default/lib/client/composables'

const page = usePageData()
const frontmatter = usePageFrontmatter<DefaultThemePageFrontmatter>()
const themeLocale = useThemeLocaleData()

// navbar
const shouldShowNavbar = computed(
  () => frontmatter.value.navbar !== false && themeLocale.value.navbar !== false
)

// sidebar
const sidebarItems = useSidebarItems()
const isSidebarOpen = ref(false)
const toggleSidebar = (to?: boolean): void => {
  isSidebarOpen.value = typeof to === 'boolean' ? to : !isSidebarOpen.value
}
const touchStart = { x: 0, y: 0 }
const onTouchStart = (e): void => {
  touchStart.x = e.changedTouches[0].clientX
  touchStart.y = e.changedTouches[0].clientY
}
const onTouchEnd = (e): void => {
  const dx = e.changedTouches[0].clientX - touchStart.x
  const dy = e.changedTouches[0].clientY - touchStart.y
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    if (dx > 0 && touchStart.x <= 80) {
      toggleSidebar(true)
    } else {
      toggleSidebar(false)
    }
  }
}

// classes
const containerClass = computed(() => [
  {
    'no-navbar': !shouldShowNavbar.value,
    'no-sidebar': true,
    'sidebar-open': false,
  },
  frontmatter.value.pageClass,
])

// close sidebar after navigation
let unregisterRouterHook
onMounted(() => {
  const router = useRouter()
  unregisterRouterHook = router.afterEach(() => {
    toggleSidebar(false)
  })
})
onUnmounted(() => {
  unregisterRouterHook()
})

// handle scrollBehavior with transition
const scrollPromise = useScrollPromise()
const onBeforeEnter = scrollPromise.resolve
const onBeforeLeave = scrollPromise.pending

document.title = 'AppleDB'
</script>

<template>
  <div
    class="theme-container"
    :class="containerClass"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <slot name="navbar">
      <Navbar v-if="true" @toggle-sidebar="toggleSidebar">
        <template #before>
          <slot name="navbar-before" />
        </template>
        <template #after>
          <slot name="navbar-after" />
        </template>
      </Navbar>
    </slot>

    <slot name="page">
      <Home v-if="frontmatter.home" />

      <Transition
        v-else
        name="fade-slide-y"
        mode="out-in"
        @before-enter="onBeforeEnter"
        @before-leave="onBeforeLeave"
      >
        <Page :key="page.path">
          <template #top>
            <slot name="page-top" />
          </template>
          <template #content-top>
            <slot name="page-content-top" />
          </template>
          <template #content-bottom>
            <slot name="page-content-bottom" />
          </template>
          <template #bottom>
            <slot name="page-bottom" />
          </template>
        </Page>
      </Transition>
    </slot>
  </div>
</template>


<style lang="scss">
@use '../../emiyl-theme/styles/index.scss';
@use '../../emiyl-theme/styles/palette.scss';

.custom-container-title {
	display: none;
}

.custom-container.tip,
.custom-container.warning,
.custom-container.danger {
	border-width: 1px;
	border-style: solid;
}

.custom-container.none {
	background-color: var(--c-container-bg);
}

.custom-container.tip {
	border-color: var(--c-tip-bg);
}

.custom-container.warning {
	border-color: var(--c-warning-bg);
}

.custom-container.danger {
	border-color: var(--c-danger-bg);
}

html.dark {
	.custom-container.warning {
		border-color: var(--c-warning);
	}

	.custom-container.danger {
		border-color: var(--c-danger);
	}
}

.custom-container {
	background-color: var(--c-tip-bg);
	color: var(--c-tip-text);
	padding: 0.1rem 1.5rem;
	margin: 1rem 0;
	border-radius: 8px;
}

@media (min-width: 720px) {
    .navbar-dropdown-wrapper .navbar-dropdown {
        display: block !important;
        border-width: 0px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-4px);
        transition: visibility 0s, opacity .25s, visibility .25s, transform .25s;
    }

    html.dark {
        .navbar-dropdown-wrapper .navbar-dropdown {
            border-width: 1px;
        }
    }

    .navbar-item .fab {
        font-size: 1.25rem;
        vertical-align: bottom;
        padding-bottom: 1px;
    }

    .navbar-dropdown-wrapper .fas {
        font-size: 1.25rem;
        vertical-align: bottom;
        padding-bottom: 1px;
    }
}

@media (max-width: 629px) {
    .navbar-item .icon {
        visibility: hidden;
        font-family: var(--c-font-family);
        font-size: 1px;
        letter-spacing: -1px;
    }

    .navbar-item i::after { 
        visibility: visible;
        font-size: 1rem;
        letter-spacing: normal;
    }

    .navbar-item .fa-globe::after { 
        content: "Language";
        padding-left: .5em;
    }

    .navbar-item .fa-github::after { 
        content: "GitHub";
        padding-left: .5em;
    }
}

.navbar-dropdown-wrapper:hover .navbar-dropdown, .navbar-dropdown-wrapper.open .navbar-dropdown {
    opacity: 1 !important;
    visibility: visible;
    transform: translateY(0);
}

.navbar-item, .navbar-item a, .navbar-item .title {
    transition: color .25s;
}

.navbar-item:hover .title, .navbar-item.router-link-active .title {
    border-bottom: 0px;
    color: var(--c-text-lightest);  
}

.navbar-item>a:hover, .navbar-item>a.router-link-active {
    border-bottom: 0px;
    color: var(--c-text-accent);  
}

.navbar-item .external-link-icon {
    display: none;
}
</style>