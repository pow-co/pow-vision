<template>
      <MyScene :key="$route.params.tag" :id="`tag: ${route.params.tag}`" />
  </template>

  <script setup>
  import { onMounted } from 'vue'
const route = useRoute()
const router = useRouter()

onMounted(() => {
  // TODO: Another hacky fix to get the control panel to appear when navigating to this page from the home page
  setTimeout(() => {
    if(document.getElementsByClassName('tp-dfwv').length === 0 ) {
    router.go(0)
  } else {
      // console.log('myScene is not mounted')
      // router.go(0)
    }
  }, 100)

})
</script>

