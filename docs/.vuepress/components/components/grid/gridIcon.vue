<template>
    <a v-if="icon.link" href="https://google.com"><i :class="icon.class"/></a>
    <i v-else :class="icon.class"/>
</template>

<script>
export default {
    props: {
        icon: Object
    }
}
</script>

<style lang="scss" scoped>
i {
    font-size: 1em;
}
</style>