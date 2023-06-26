<template>
    <TresCanvas v-bind="gl" window-size>
      <TresPerspectiveCamera :position="[0, 1.7, 30]" :look-at="[0, 0, 0]" />

      <OrbitControls :enabled="config.orbitControlsEnabled" />
      <Stars/>
      <SampleSphere
      v-for="item in rankings"
      :key="item.tag"
      :position="getRandomPosition()"
      :sphereRadius="getScaledRadius(item.difficulty)"
      :tag="item.tag"
    />
         </TresCanvas>
  </template>

  <script setup>
  import { OrbitControls, useTweakPane } from '@tresjs/cientos'
  import { reactive, ref, onMounted, nextTick } from 'vue'
  const { pane } = useTweakPane()

  const config = reactive({
    orbitControlsEnabled: true,
  })

  const gl = reactive({
    clearColor: '#595959',
    powerPreference: 'high-performance',
  })

  const cleanString = (input) => {
    console.log('input', input)
    var output = "";
    for (var i=0; i<input.length; i++) {
        if (input.charCodeAt(i) <= 127) {
            output += input.charAt(i);
        }
    }
    return output;
}
  const rankings = ref([])

  onMounted(async () => {
  const { data } = await useFetch('https://pow.co/api/v1/boost/rankings/tags?start_date=1687726330')

  if (data.value?.rankings) {
    rankings.value = data.value.rankings
      .map((ranking) => {
        let tag = ranking.tag
        try {
          tag = Buffer.from(ranking.tag, 'hex').toString()
          tag = cleanString(tag)
        } catch (error) {
          tag = ''
        }
        return Object.assign(ranking, {
          tag
        })
      })
      .filter((tag) => !/\s/.test(tag.tag))
      .filter((tag) => !/[&\/\\#,()$~%'":?<>{}]/.test(tag.tag))
      .filter((tag) => tag.tag != '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00')
      .filter((tag) => tag.tag != '')
  }

  console.log('rankings', rankings.value)
  await nextTick()
  createDebugPane()
})



  function createDebugPane() {
    pane.addSeparator()
    pane.addInput(gl, 'clearColor', { label: 'Clear Color' })
    pane.addSeparator()
    pane.addInput(config, 'orbitControlsEnabled', {
      label: 'Orbit Controls enabled',
    })
    // pane.addSeparator()

    // pane.addButton({ title: 'Increase counter (Pinia)' }).on('click', () => {
    //   // sampleStore.increment()
    // })
    // pane.addButton({ title: 'Decreate counter (Pinia)' }).on('click', () => {
    //   // sampleStore.decrement()
    // })
  }

  function getRandomPosition() {
    const x = getRandomNumber(-10, 10)
    const y = getRandomNumber(-10, 10)
    const z = getRandomNumber(-10, 10)
    return [x, y, z]
  }

  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min
  }

  function getScaledRadius(difficulty) {
  // Scale the difficulty value to a desired range of radius values
  const minDifficulty = 0.000001
  const maxDifficulty = 2
  const minRadius = 0.05
  const maxRadius = 5

  // Map the difficulty value from its range to the radius range using a linear interpolation formula
  const scaledRadius =
    ((difficulty - minDifficulty) * (maxRadius - minRadius)) /
    (maxDifficulty - minDifficulty) +
    minRadius

  // Limit the number of decimal places to 2
  const scaledRadiusLimited = parseFloat(scaledRadius.toFixed(2))

  return scaledRadiusLimited
}
  </script>
