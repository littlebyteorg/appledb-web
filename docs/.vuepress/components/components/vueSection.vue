<template>
    <list           v-if="section.type == 'list'"           :content="section.content" :sectionClass="section.class || ''"/>
    <propertyBox    v-if="section.type == 'propertyBox'"    :content="section.content" :sectionClass="section.class || ''"/>
    <grid           v-if="section.type == 'grid'"           :content="section.content" :sectionClass="section.class || ''"/>
</template>

<script>
export default {
    props: {
        section: Object
    }
}
</script>