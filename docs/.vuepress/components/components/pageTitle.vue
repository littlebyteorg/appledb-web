<template>
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
</template>

<script>
export default {
    props: {
        content: Object
    }
}
</script>

<style lang="scss" scoped>
.subtitle {
    margin-bottom: 1em;
    display: flex;
    flex-flow: row wrap;
    
    .buildNum {
        color: red;
    }

    .text {
        margin-right: .5em;
    }

    .tag {
        border-radius: 4em;
        border: 1px solid;
        padding: 5px 9px;
        text-transform: uppercase;
        font-size: calc(1em - 2px);
        font-weight: 700;
        font-size: .5em;
        letter-spacing: .5px;
        margin-right: 1em;
    }
}
</style>