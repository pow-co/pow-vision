<template>
    <Suspense>
        <Text3D font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json" center
            :position="[position.x, position.y, position.z]" :text="`${text}`" :size="size" :height="0.5"
            :curveSegments="1">
            <TresMeshNormalMaterial />
        </Text3D>
    </Suspense>
</template>

<script setup>
import { useRenderLoop } from '@tresjs/core'

//
// Props
//
const props = defineProps({
    position: {
        type: Object,
    },
    text: {
        type: String,
    },
    size: {
        type: Number,
    },
})
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
function onBoxClick (event) {

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

function onPointerenter () {
    document.body.style.cursor = 'pointer'
    showDifficulty.value = true
}

function onPointerleave () {
    document.body.style.cursor = null
    showDifficulty.value = false
}
</script>
