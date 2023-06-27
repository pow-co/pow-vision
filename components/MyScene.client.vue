<template>
  <div>
    <TresCanvas v-if="filteredRankings.length" v-bind="gl" window-size>
      <TresPerspectiveCamera :position="[0, 1.7, 30]" :look-at="[0, 0, 0]" />

      <OrbitControls :enabled="config.orbitControlsEnabled" />
      <Stars/>
      <SampleSphere
        v-for="item in filteredRankings"
        :key="item.tag"
        :position="item.position"
        :difficulty="item.difficulty"
        :sphereRadius="getScaledRadius(item.difficulty)"
        :tag="item.tag"
      />
    </TresCanvas>
  </div>
</template>

<script setup>
import { OrbitControls, useTweakPane } from '@tresjs/cientos'
import { reactive, ref, onMounted, nextTick, computed } from 'vue'
import { useRenderLoop } from '@tresjs/core'
const { onLoop } = useRenderLoop()
const timeFrame = reactive({ timestamp: 'last24hr' });
const maxSpheres = ref(25); // Default maximum number of spheres
const filteredRankings = computed(() => rankings.value.slice(0, maxSpheres.value));

const currentTimestamp = computed(() => {
  const now = Math.floor(Date.now() / 1000);
  switch (timeFrame.timestamp) {
    case 'last1hr':
      return now - (1 * 60 * 60);
    case 'last24hr':
      return now - (24 * 60 * 60);
    case 'last7d':
      return now - (7 * 24 * 60 * 60);
    case 'last1m':
      return now - (30 * 24 * 60 * 60);
    case 'lastyear':
      return now - (365 * 24 * 60 * 60);
    case 'alltime':
    default:
      return null;
  }
});

async function fetchData() {
  const timestamp = currentTimestamp.value;
  const url = timestamp ? `https://pow.co/api/v1/boost/rankings/tags?start_date=${currentTimestamp.value}` : 'https://pow.co/api/v1/boost/rankings/tags';

  const { data } = await useFetch(url);
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
          tag,
          position: getPositionBasedOnDifficulty(ranking.difficulty),
          rotation: getRandomRotation(),
          orbitSpeed: getRandomNumber(0, 0.01) + 0.1,
          velocity: [0, 0, 0],
        })
      })
      .filter((tag) => !/\s/.test(tag.tag))
      .filter((tag) => !/[&\/\\#,()$~%'":?<>{}]/.test(tag.tag))
      .filter((tag) => tag.tag != '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00')
      .filter((tag) => tag.tag != '')
  }
}

const { pane } = useTweakPane()

const config = reactive({
  orbitControlsEnabled: true,
})

const gl = reactive({
  clearColor: '#595959',
  powerPreference: 'high-performance',
})

const cleanString = (input) => {
  var output = "";
  for (var i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}

const rankings = ref([])

onMounted(async () => {
  await fetchData();

  await nextTick()
  createDebugPane()

  onLoop(({ elapsed }) => {
  filteredRankings.value.forEach((item) => {
    const angle = elapsed * item.orbitSpeed;

    // Calculate min and max difficulties based on filtered rankings
    const minDifficulty = filteredRankings.value[filteredRankings.value.length - 1].difficulty;
    const maxDifficulty = filteredRankings.value[0].difficulty;

    const minDistanceFromCenter = 5;
    const maxDistanceFromCenter = 15;
    const distanceFromCenter =
      ((maxDifficulty - item.difficulty) *
        (maxDistanceFromCenter - minDistanceFromCenter)) /
        (maxDifficulty - minDifficulty) +
      minDistanceFromCenter;

    const newPosition = getPositionBasedOnAngle(angle, distanceFromCenter, item.rotation);
    item.position = newPosition;
  });
});
})

function createDebugPane() {
  pane.addSeparator();
  pane.addInput(gl, 'clearColor', { label: 'Clear Color' });
  pane.addSeparator();
  pane.addInput(config, 'orbitControlsEnabled', {
    label: 'Orbit Controls enabled',
  });
  pane.addSeparator();
  const timeFrameSelector = pane.addInput(timeFrame, 'timestamp', {
    options: {
      'Last 1 hour': 'last1hr',
      'Last 24 hours': 'last24hr',
      'Last 7 days': 'last7d',
      'Last 1 month': 'last1m',
      'Last year': 'lastyear',
      'All-time': 'alltime',
    },
  });
  pane.addInput(maxSpheres, 'value', { label: 'Max Spheres', min: 1, max: 100 });

  timeFrameSelector.on('change', function (ev) {
    setNewTimeStamp(ev.value);
  });
}

function setNewTimeStamp(value) {
  timeFrame.timestamp = value;
  fetchData();
}

function getPositionBasedOnDifficulty(difficulty) {
  const minDistance = 0;
  const maxDistance = 100;
  const distanceFromOrigin = minDistance + difficulty * 2; // Modified line

  const angle = getRandomNumber(0, 2 * Math.PI);
  const offset = getRandomNumber(0, 2); // Adjust this value to control the randomness

  const x = distanceFromOrigin * Math.cos(angle);
  const y = distanceFromOrigin * Math.sin(angle);
  const z = 0;

  return [x, y, z];
}
function getPositionBasedOnAngle(angle, distanceFromCenter, rotation) {
  const x = distanceFromCenter * Math.cos(-angle + rotation[0])
  const y = distanceFromCenter * Math.sin(-angle + rotation[1])
  const z = distanceFromCenter * Math.cos(-angle + rotation[2])
  return [x, y, z]
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomRotation() {
  const rotationX = getRandomNumber(0, 2 * Math.PI)
  const rotationY = getRandomNumber(0, 2 * Math.PI)
  const rotationZ = getRandomNumber(0, 2 * Math.PI)
  return [rotationX, rotationY, rotationZ]
}

function getScaledRadius(difficulty) {
  // Calculate min and max difficulties based on filtered rankings
  const minDifficulty = filteredRankings.value[filteredRankings.value.length - 1].difficulty;
  const maxDifficulty = filteredRankings.value[0].difficulty;

  const minRadius = 0.2;
  const maxRadius = 10;
  const scalingFactor = 0.1; // Adjust this value to control the scaling

  const scaledRadius =
    ((difficulty - minDifficulty) * scalingFactor * (maxRadius - minRadius)) /
    (maxDifficulty - minDifficulty) +
    minRadius;

  const scaledRadiusLimited = parseFloat(scaledRadius.toFixed(2));

  return scaledRadiusLimited;
}
</script>
