<template>
    <div
        class="container"
        :style="{
            'flex-direction': content.image.align == 'right' ? 'row' : 'row-reverse'
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
                'margin-right': content.image.align == 'left' ? '1em' : '0em'
            }"
        >
            <img :src="`https://img.appledb.dev/device@preview/${content.image.url}/0.png`">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        content: Object
    }
}
</script>

<style lang="scss" scoped>
.container {
    margin-top: 1em;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
}

.image {
    margin-top: .75em;

    img {
        height: 5em;
        width: 5em;
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