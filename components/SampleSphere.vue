<template>

    <TresMesh
      ref="boxRef"
      @pointer-enter="onPointerenter"
      @pointer-leave="onPointerleave"
    >
    <BaseText
    v-if="showDifficulty"
    :position="{x: -sphereRadius, y: -sphereRadius, z: 0}"
    :text="`${shortDifficulty}`"
    :size="sphereRadius * 0.75"
  />
      <Suspense>
        <Text3D
          font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
          center
          :position="[sphereRadius, sphereRadius, sphereRadius]"
          :text="getText(props.tag)"
          :size="sphereRadius*1.1"
          :height="0.5"
          :curveSegments="1"
        >
          <TresMeshNormalMaterial />
        </Text3D>
      </Suspense>

      <Sphere
      @click="showTagAlert"
      @pointer-enter="onPointerenter"
      @pointer-leave="onPointerleave"
      :args="[sphereRadius, 12, 12]">
        <TresMeshNormalMaterial />
      </Sphere>
    </TresMesh>


</template>

<script setup>
  const router = useRouter();
  import { useRenderLoop, useTres } from '@tresjs/core';
const { state } = useTres()
// console.log('sub', state) // THREE.WebGLRenderer

const emit = defineEmits(['showContent'])

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
    difficulty: {
      type: Number,
    },
    contents: {
      type: Object
    }
  })
  const showDifficulty = ref(false)
  const shortDifficulty = computed (() => {
    // Difficulty to 4 decimal places or less, if zereos after decimal, remove them
    return props.difficulty.toFixed(4).replace(/\.?0*$/,'')
  })
  const getText = (tag) => {
    if (tag) {
      return tag
    } else {
      if(props?.contents?.content?.map?.type) {
        return props?.contents?.content?.map?.type
      } else if(props?.contents?.content?.content_type) {
        return props?.contents?.content?.content_type
      }
      else if(props?.contents?.content?.bmap?.MAP[0]?.type === 'ord') {
        return 'Ordinal'
      }
      else {
        return 'Unknown'
      }
    }
  }
  const showTagAlert= () => {
    // Vue Router push to the tag /topics/tag
    if(props.contents) {
      emit('showContent', {content: props.contents, difficulty: props.difficulty})
    // window.open(`https://pow.co/${props.contents.content.txid}`, '_blank', 'noopener noreferrer')
    } else {
    router.push({ path: `/topics/${props.tag}` })
    }
    // Open a new window and go to www.pow.co/topic/{tag}
    // window.open(`https://pow.co/topics/${props.tag}`, '_blank', 'noopener noreferrer')
    }

  const boxRef = shallowRef('boxRef')


  function onPointerenter() {
    document.body.style.cursor = 'pointer'
    showDifficulty.value = true
  }

  function onPointerleave() {
    document.body.style.cursor = null
    showDifficulty.value = false
  }

</script>
