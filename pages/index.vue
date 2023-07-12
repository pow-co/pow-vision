<template>
  <MyScene :key="key" @mounted-successfully="handleMounted" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const router = useRouter()
const mountedSuccessfully = ref(false)
const key = ref()

const handleMounted = () => {
  mountedSuccessfully.value = true
}

onMounted(() => {
  // TODO: There is a bug if you navigate back to the home page
  // from a tag in the cientos package. This ia hacky fix.
  setTimeout(() => {
    if (mountedSuccessfully.value) {
      // console.log('myScene is mounted')
    } else {
      // console.log('myScene is not mounted')
      router.go(0)
    }
  }, 500)

})

onUnmounted(() => {
  // console.log('myScene is unmounted')
    key.value +=1
})


  ;
</script>