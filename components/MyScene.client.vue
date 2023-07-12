<template>
  <div>
    <LoadSpinner v-if="loading" />
    <ContentViewer
    v-if="showContent"
    @close="showContent = false"
    :difficulty="clickedDifficulty"
    :content="clickedContent"
    class="" size="sm" round
     outline
  />
  <div class="test">
    <TresCanvas :id="tresID" :ref="tresID" v-if=" !loading && filteredRankings && filteredRankings.length" v-bind="gl" window-size>
      <TresPerspectiveCamera :position="[0, 1.7, 30]" :look-at="[0, 0, 0]" />
      <OrbitControls :enabled="config.orbitControlsEnabled" />
      <Stars />

      <SampleSphere @show-content="handleShowContent" v-for="item in filteredRankings" :position="item.position" :ref="item.tag" :key="item.tag" :contents="item?.contents"
        :difficulty="item.difficulty" :sphereRadius="getScaledRadius(item?.difficulty ? item.difficulty : item)" :tag="item.tag" />

    </TresCanvas>

  </div>



  </div>
</template>

<script setup>
import { OrbitControls, useTweakPane } from '@tresjs/cientos'
import { reactive, ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRenderLoop,  } from '@tresjs/core';

// Return a random number so that there is a low chance of two canvases having the same ID
const tresID = Math.random()

const emit = defineEmits(['mountedSuccessfully'])
const clickedContent = ref(null)
const clickedDifficulty = ref(null)
const showContent = ref(false)
const currentTag = ref(false)

const handleShowContent = (content)=> {
  clickedContent.value = content.content
  clickedDifficulty.value = content.difficulty
  showContent.value = true
}
  //
  // Props
  //
  const props = defineProps({
    id: {
      type: String,
    },
  })

const isMounted = reactive({ value: false });
const tresCanvas = ref(null); // Create a ref

const { onLoop } = useRenderLoop()
const timeFrame = reactive({ timestamp: 'last24hr' });
const loading = ref('true');
const maxSpheres = ref(50); // Default maximum number of spheres
const filteredRankings = computed(() => rankings.value.slice(0, maxSpheres.value));
const totalDifficulty = computed(() => filteredRankings.value.slice(0, maxSpheres.value).reduce((acc, cur) => acc + cur.difficulty, 0));
console.log('totalDifficulty is: ', totalDifficulty)
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

async function fetchData (tag) {

  let passedTag

  if (tag) {
    // console.log('tag is : ', tag)
    currentTag.value = tag
    try {
      passedTag = Buffer.from(tag, 'utf-8').toString('hex')
    } catch (error) {
      passedTag = '';
    }
  }

  loading.value = true
  const timestamp = currentTimestamp.value;
  let url
  if (passedTag) {
    url = `https://pow.co/api/v1/boost/rankings?start_date=${currentTimestamp.value}&tag=${passedTag}`
  } else {
    url = timestamp
      ? `https://pow.co/api/v1/boost/rankings/tags?start_date=${currentTimestamp.value}`
      : 'https://pow.co/api/v1/boost/rankings/tags';
  }

  try {
    // console.log('url', url)

    const { data } = await useFetch(url);

    // console.log('data', data)

    if (data?.value?.rankings && !passedTag) {
      const newRankings = data.value.rankings
        .map((ranking) => {
          let tag = ranking.tag;
          try {
            tag = Buffer.from(ranking.tag, 'hex').toString();
            tag = cleanString(tag);
          } catch (error) {
            tag = '';
          }
          return {
            ...ranking,
            tag,
            position: getPositionBasedOnDifficulty(ranking.difficulty),
            rotation: getRandomRotation(),
            orbitSpeed: getRandomNumber(0, 0.01) + 0.01,
            velocity: [0, 0, 0],
          };
        })
        .filter((tag) => !/\s/.test(tag.tag))
        .filter((tag) => !/[&\/\\#,()$~%'":?<>{}]/.test(tag.tag))
        .filter(
          (tag) =>
            tag.tag !==
            '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
        )
        .filter((tag) => tag.tag !== '');


      rankings.value = newRankings;
      filteredRankings.length = maxSpheres.value;
    } else {
const newRankings = await Promise.all(data.value.rankings.map(async (ranking) => {
  try {
    const { data } = await useFetch(`https://pow.co/api/v1/content/${ranking.content_txid}`);
    return {
      ...ranking,
      contents: data.value,
      position: getPositionBasedOnDifficulty(ranking.difficulty),
      rotation: getRandomRotation(),
      orbitSpeed: getRandomNumber(0, 0.01) + 0.01,
      velocity: [0, 0, 0],
    };
  } catch (error) {
    console.log('error is: ', error);
  }
}));


      rankings.value = newRankings;
      filteredRankings.length = maxSpheres.value;

    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  loading.value = false
}

const { pane } = useTweakPane()

const config = reactive({
  orbitControlsEnabled: true,
})

const gl = reactive({
  clearColor: '#595959',
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
  const route = useRoute()
  // console.log('route', route)
  const tag = route?.params?.tag
  // console.log('tag is: ', tag)

  await nextTick();

  await fetchData(tag);
  //   const previewLinkTest = await useFetch('/api/preview', {
  //   query: {
  //       url: 'https://tresjs.org',
  //     }
  //   })

  // console.log('previewLinkTest', previewLinkTest)

  await createDebugPane();
  onLoop(({ elapsed }) => {
    filteredRankings.value.forEach((item, index) => {
      if(item  && item.position) {

      const angle = elapsed * item.orbitSpeed;

      // Calculate min and max difficulties based on filtered rankings
      let minDifficulty = filteredRankings.value[filteredRankings.value.length - 1].difficulty;
      let maxDifficulty = filteredRankings.value[0].difficulty;

      const minDistanceFromCenter = 5;
      const maxDistanceFromCenter = 15;

      // If the minDifficulty and maxDifficulty are the same, add 10% to the maxDifficulty to avoid a divide by zero error
      if (minDifficulty === maxDifficulty) {
        maxDifficulty = maxDifficulty * 1.1;
      }

      const distanceFromCenter =
        ((maxDifficulty - item.difficulty) *
          (maxDistanceFromCenter - minDistanceFromCenter)) /
        (maxDifficulty - minDifficulty) +
        minDistanceFromCenter;

      const newPosition = getPositionBasedOnAngle(angle, distanceFromCenter, item.rotation);
      item.position = newPosition;
      }
    });
  })
  emit('mountedSuccessfully')
});

function createDebugPane () {
  console.log('in createDebugPane')
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

function setNewTimeStamp (value) {
  timeFrame.timestamp = value;
  fetchData(currentTag.value);
}

function getPositionBasedOnDifficulty (difficulty) {
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
function getPositionBasedOnAngle (angle, distanceFromCenter, rotation) {
  const x = distanceFromCenter * Math.cos(-angle + rotation[0])
  const y = distanceFromCenter * Math.sin(-angle + rotation[1])
  const z = distanceFromCenter * Math.cos(-angle + rotation[2])
  // console.log('x, y, z', x, y, z)
  return [x, y, z]
}

function getRandomNumber (min, max) {
  return Math.random() * (max - min) + min
}

function getRandomRotation () {
  const rotationX = getRandomNumber(0, 2 * Math.PI)
  const rotationY = getRandomNumber(0, 2 * Math.PI)
  const rotationZ = getRandomNumber(0, 2 * Math.PI)
  return [rotationX, rotationY, rotationZ]
}

function getScaledRadius (difficulty) {

  // Calculate min and max difficulties based on filtered rankings
  const minDifficulty = filteredRankings.value[filteredRankings.value.length - 1].difficulty;

  let maxDifficulty = filteredRankings.value[0].difficulty;

  const minRadius = 0.2;
  const maxRadius = 10;
  const scalingFactor = 0.1; // Adjust this value to control the scaling

  // If min and max difficulty are the same, add 10% more to max difficulty
  // to avoid division by zero
  if (minDifficulty === maxDifficulty) {
    maxDifficulty = maxDifficulty * 1.1;
  }

  const scaledRadius =
    ((difficulty - minDifficulty) * scalingFactor * (maxRadius - minRadius)) /
    (maxDifficulty - minDifficulty) +
    minRadius;



  const scaledRadiusLimited = parseFloat(scaledRadius.toFixed(2));
  return scaledRadiusLimited;
}
</script>

<style>
.test {
  width: 200px;
  height: 100%;
  background-color: red;
}

</style>
