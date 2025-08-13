<template>
    <div
        class="container"
        :style="{
            'flex-direction': content.image && content.image.align == 'right' ? 'row' : 'row-reverse'
        }"
    >
        <div class="text">
            <h1>{{ content.header }}</h1>
            <div class="subtitle" v-if="content.subtitle">
                <div class="text" v-if="content.subtitle.text" v-html="content.subtitle.text"/>
                <div
                    v-for="tag in content.subtitle.tags"
                    :key="tag"
                    class="tag"
                    :style="{'color': tag.colour}"
                >
                    {{ tag.text }}
                </div>
            </div>
        </div>
        <div
            class="image"
            v-if="content.image && content.image.url"
            :style="{
                'margin-right': content.image && content.image.align == 'left' ? '1em' : '0em'
            }"
        >
            <picture>
                <source :srcset="`https://img.appledb.dev/images@preview/${content.image.url}/${content.image.images[0].id}${isDarkMode && content.image.images[0].dark ? '_dark' : ''}.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/images@preview/${content.image.url}/${content.image.images[0].id}${isDarkMode && content.image.images[0].dark ? '_dark' : ''}.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/images@preview/${content.image.url}/${content.image.images[0].id}${isDarkMode && content.image.images[0].dark ? '_dark' : ''}.png`">
            </picture>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
export default {
    data() {
        return {
            isDarkMode: useDarkMode()
        }
    },
    props: {
        content: Object
    }
}
</script>

<style lang="scss" scoped>
.container {
    margin-block: 1em;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.image {
    margin-top: .75em;

    img {
        max-height: 5em;
        max-width: 5em;
    }
}

.text {
    margin-right: auto;

    h1 {
        padding-top: var(--navbar-height);
    }
}

.subtitle {
    margin-bottom: 1em;
    display: flex;
    flex-flow: row wrap;

    .text {
        margin-right: .5em;
    }

    .tag {
        border-radius: 4em;
        border: 1px solid;
        padding: 5px 9px;
        text-transform: uppercase;
        font-weight: 700;
        font-size: .5em;
        letter-spacing: .5px;
        margin-right: 1em;
    }
}
</style>