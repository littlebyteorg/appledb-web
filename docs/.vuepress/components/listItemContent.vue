<template>
    <span v-if="text" v-html="text"/>
    <template v-if="data">
        <span>{{ data.slice(0,3).join(', ') }}</span>
        <template v-if="data.length > 3">
            <span v-if="expanded">, {{ data.slice(3).join(', ') }}</span>
            <span v-else>, <a style="cursor: pointer; text-decoration: none;" v-on:click="expanded = true">...</a></span>
        </template>
    </template>
</template>

<script>
export default {
    data() {
        return {
            expanded: false
        }
    },
    props: {
        text: String,
        data: Array
    }
}
</script>

<style>

</style>