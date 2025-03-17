<template>
    <div class="gridElement"
        :style="{
            'grid-template-columns': imageUrl ? '4em calc(100% - 4em)' : '100%'
        }" :class="sectionClass">
        <div class="img" v-if="imageUrl">
            <template v-if="content.imgFlags && content.imgFlags.internal">
                <source :srcset="imageUrl + '.avif'" type="image/avif">
                <source :srcset="imageUrl + '.webp'" type="image/webp">
                <img :src="imageUrl + '.png'">
            </template>
        </div>
        <div class="text">
            <div class="title">{{ content.title }}</div>
            <div class="subtitle">
                {{ content.subtitle }}
                <div class="iconRow" v-if="content.icons">
                    <gridIcon v-for="icon in content.icons" :key="icon" :icon="icon"/>
                </div>
                <div class="links" v-if="content.links">
                    <ul>
                        <li v-for="link in content.links" :key="link">
                            <a v-if="link.link" :href="link.link"><i v-if="link.icon" :class="link.icon"></i> {{ link.text }}</a>
                            <template v-else><i v-if="link.icon" :class="link.icon"></i> {{ link.text }}</template>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

export default {
    props: {
        content: Object,
        sectionClass: String
    },
    data() {
        return {
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        imageUrl() {
            if (!this.content.img) return
            if (!this.content.imgFlags) return this.content.img

            const flags = this.content.imgFlags
            const imgName = (flags.names || ['0'])[0]

            if (flags.internal) {
                const baseUrl = 'https://img.appledb.dev/device@preview'
                const imgKey = this.content.img
                const dark = (flags.dark && this.isDarkMode) ? '_dark' : ''

                return [baseUrl,imgKey,imgName+dark].join('/')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.gridElement {
    padding: 1em;
    border-radius: 8px;
    display: grid;
    height: calc(100% - 2.5em);
    transition: 75ms background ease-in-out, 75ms border-color ease-in-out;

    &:hover {
        background: var(--c-border);

        &.blue {
            background: var(--c-tip-bg-hover);
        }
    }

    .title {
        font-weight: 600;
        font-size: 1.2em;
        padding-bottom: 6px;
        width: calc(100% - 2em);
    }

    .links {
        ul {
            padding-left: 0;
            list-style-type: none;
        }

        i {
            font-size: 0.9em;
        }
    }

    .img {
        img {
            max-height: 8em;
            max-width: 3em;
        }
    }

    .iconRow {
        display: inline-flex;
        flex-flow: row wrap;
        padding-left: 4px;
    }
}
</style>