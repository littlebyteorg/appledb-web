<template>
    <list v-if="section.type == 'list'" :content="section.content" :sectionClass="section.class || ''"/>
</template>

<script>
export default {
    props: {
        section: Object
    }
}
</script>