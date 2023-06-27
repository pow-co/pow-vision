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
        :position="[sphereRadius, sphereRadius, sphereRadius]"
        :text="`${tag}`"
        :size="sphereRadius"
        :height="0.5"
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
  })

  //
  // Refs
  //
  const { $gsap } = useNuxtApp()
  const { onLoop } = useRenderLoop()

  const boxRef = shallowRef('boxRef')

  //
  // Lifecycle
  //
  onMounted(async () => {
    await nextTick()

    onLoop(({ elapsed }) => {

    });
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
      ease: 'elastic.inOut(3.5, 1)',
    })
  }

  function onPointerenter() {
    document.body.style.cursor = 'pointer'
  }

  function onPointerleave() {
    document.body.style.cursor = null
  }
</script>
