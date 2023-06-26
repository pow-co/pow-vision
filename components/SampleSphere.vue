<template>

    <TresMesh
      ref="boxRef"
      @click="onBoxClick"
      @pointer-enter="onPointerenter"
      @pointer-leave="onPointerleave"
    >
    <Suspense>
      <Text3D
        font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
        center
        :position="[givenPosition[0] + sphereRadius, givenPosition[1] + sphereRadius, givenPosition[2] + sphereRadius]"
        :text="`${tag}`"
        :size="sphereRadius * 0.65"
        :height="0.2"
        :curveSegments="1"
      >
      <TresMeshNormalMaterial />
    </Text3D>
  </Suspense>

  <Sphere :args="[sphereRadius, 12, 12]" color="pink">
    <TresMeshNormalMaterial />
  </Sphere>

</TresMesh>
</template>
<!-- <TresMeshMatcapMaterial :matcap="matcapTexture" /> -->

  <script setup>
  import { useRenderLoop } from '@tresjs/core'

  //
  // Props
  //
  const props = defineProps({
    sphereRadius: {
      type: Number,
    },
    tag: {
      type: String,
    },
    givenPosition: {
      type: Array,
      default: () => [0, 0, 0],
    },
  })

  //
  // Refs
  //
  const { $gsap } = useNuxtApp()
  // const { onLoop } = useRenderLoop()

  const boxRef = shallowRef('boxRef')

  //
  // Lifecycle
  //
  onMounted(async () => {
    await nextTick()
    // onLoop(({ elapsed }) => {
    //   boxRef.value.rotation.y += 0.01
    //   boxRef.value.rotation.z += 0.0074
    //   boxRef.value.position.y = Math.sin(elapsed) * 0.5
    // })
  })

  //
  // Methods
  //
  function onBoxClick(event) {
    if ($gsap.isTweening(event.object.scale)) return

    $gsap.to(event.object.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      repeat: 1,
      yoyo: true,
      duration: 1,
      ease: 'elastic.inOut(3.5, 1)'
    })
  }

  function onPointerenter() {
    document.body.style.cursor = 'pointer'
  }

  function onPointerleave() {
    document.body.style.cursor = null
  }
  </script>
