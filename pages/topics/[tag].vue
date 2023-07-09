<template>
    <p>Tag is: {{ $route.params.tag }}</p>
    <MyScene />
  </template>

  <script setup>
const route = useRoute()

if (route.params.group === 'admins' && !route.params.id) {
  console.log('Warning! Make sure user is authenticated!')
}
</script>