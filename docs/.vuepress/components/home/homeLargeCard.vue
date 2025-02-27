<template>
    <div class="wrapper">
        <div class="img">
            <picture v-for="i in card.image.count || 1" :key="i">
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${i-1}${isDarkMode && card.image.dark ? '_dark' : ''}.avif`" type="image/avif">
                <source :srcset="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${i-1}${isDarkMode && card.image.dark ? '_dark' : ''}.webp`" type="image/webp">
                <img :src="`https://img.appledb.dev/${card.image.type}@256/${card.image.key}/${i-1}${isDarkMode && card.image.dark ? '_dark' : ''}.png`">
            </picture>
        </div>
        <div class="text">
            <h1>{{ card.title }}</h1>
        </div>
        <div class="subtext">
            {{ card.text }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    position: static !important;
    display: flex;
    flex-direction: column;
    gap: 0;

    min-width: 14em;
    padding: 1.7em;
    border-radius: 1em;

    background: var(--c-container-bg);
    box-shadow: 2px 4px 12px rgba(0,0,0,.08);
    transition: all .2s cubic-bezier(0,0,.5,1);

    &:hover {
        box-shadow: 2px 4px 16px rgba(0,0,0,.16);
        transform: scale(1.02);
    }
}

.text {
    h1 {
        margin-block: 0;
        padding-block: 0;
        font-size: 1.6em;
    }

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-top: 1em;
}

.subtext {
    margin-top: 1em;
}

.img {
    min-height: 10em;
    max-height: 10em;
    overflow-y: hidden; 

    img {
        max-height: 8em;
        padding-block: 1em;
    }

    picture {
        margin-right: .5em;

        &:last-of-type {
            margin-right: 0;
        }
    }

    text-align: center;
}
</style>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

export default {
    props: {
        card: Object
    },
    data() {
        return {
            isDarkMode: useDarkMode()
        }
    }
}
</script>
