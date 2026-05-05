<template>
    <div class="gridWrapper" :style="{
            'grid-template-columns':    content.length == 1 ? '100%' : '',
            'width':                    content.length == 1 ? '100%' : '',
        }">
        <template
            v-for="i in content"
            :key="i.key"
        >
            <gridElement :sectionClass="sectionClass" class="gridElement" :content="i"/>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        content: Array,
        sectionClass: String
    }
}
</script>

<style lang="scss" scoped>
.gridWrapper {
    display: grid;
    grid-template-columns: 50% 50%;
    gap: .5em 1em;
    transition: 75ms background ease-in-out;
    width: calc(100% - 1em);

    a {
        color: var(--c-text);
        font-weight: initial;

        &:hover {
            text-decoration: initial;
        }
    }
}

@media screen and (max-width: 575px) {
    .gridWrapper {
        grid-template-columns: 100%;
        width: 100%;
    }
}
</style>