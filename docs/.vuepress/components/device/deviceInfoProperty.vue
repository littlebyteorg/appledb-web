<template>
    <div :class="inline ? 'inlineWrapper' : ''">
        <div class="title">{{ property.title }}</div>
        <div>
            <template v-if="!inline && property.infoString.split(', ').length > 5 && !showAll[property.key]">
                {{ property.infoString.replace(property.infoString, property.infoString.split(', ').slice(0, 3).join(', ')) }}, <a style="user-select: none; cursor: pointer;" v-on:click="showAll[property.key] = true">...</a>
            </template>
            <template v-else v-once>{{ property.infoString }}</template>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        property: Object,
        showAll: Object,
        inline: Boolean
    }
}
</script>

<style lang="scss" scoped>
.title {
    font-weight: 700;
    margin-block: 0 .4em;
    color: var(--c-text-light);
    text-transform: uppercase;
    font-size: .8em;

    margin-top: 1.5em;
    &:first-of-type {
        margin-top: 0;
    }
}

a {
    color: var(--c-text-lightest);
    font-weight: 500;
}

.inlineWrapper {
    display: grid;
    grid-template-columns: 20% 80%;
}
</style>