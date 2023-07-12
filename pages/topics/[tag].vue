<template>
      <MyScene :key="$route.params.tag" :id="`tag: ${route.params.tag}`" />
  </template>

  <script setup>
const route = useRoute()
</script>