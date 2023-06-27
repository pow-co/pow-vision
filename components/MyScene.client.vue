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
const timeFrame = reactive({timestamp: 'last7d'});
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
    case 'alltime':
    default:
      return null;
  }
});

async function fetchData() {
  const timestamp = currentTimestamp.value;
  console.log('currentTimestamp', currentTimestamp)
  const url = timestamp ? `https://pow.co/api/v1/boost/rankings/tags?start_date=${currentTimestamp.value}` : 'https://pow.co/api/v1/boost/rankings/tags';

  const { data } = await useFetch(url);
  // Update rankings based on fetched data
  // Rest of the code
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
          orbitSpeed: getRandomNumber(0, 0.01) + ranking.difficulty * 0.1, // Random orbit speed between 0.1 and 0.6 with higher difficulty resulting in higher speed
          velocity: [0, 0, 0], // Initial velocity of the sphere
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
  for (var i=0; i<input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}
const rankings = ref([])

onMounted(async () => {
  // Fetch data and update rankings
  await fetchData();


  await nextTick()
  createDebugPane()

  onLoop(({ elapsed }) => {
    rankings.value.forEach((item, index) => {
      const angle = elapsed * item.orbitSpeed // Adjust the speed of rotation as per your requirement
      const distanceFromCenter = 15 - (item.difficulty * 10) // Adjust the scaling factor as per your requirement

      // Update position and check for collisions
      const newPosition = getPositionBasedOnAngle(angle, distanceFromCenter, item.rotation)
      const collided = checkCollision(newPosition, item, index)

      if (collided) {
        // Reverse the orbit direction and update velocity
        item.orbitSpeed *= -1
        item.velocity = [0, 0, 0]
      } else {
        // Update position based on velocity
        item.position = newPosition

        // Apply gravity and update velocity
        const gravity = 0.005
        item.velocity[1] -= gravity
        item.position[0] += item.velocity[0]
        item.position[1] += item.velocity[1]
        item.position[2] += item.velocity[2]
      }
    })
  })
})

function createDebugPane() {
  pane.addSeparator();
  pane.addInput(gl, 'clearColor', { label: 'Clear Color' });
  pane.addSeparator();
  pane.addInput(config, 'orbitControlsEnabled', {
    label: 'Orbit Controls enabled',
  });
  pane.addSeparator();
  console.log('currentTimestamp', currentTimestamp)
  const timeFrameSelector = pane.addInput(timeFrame, 'timestamp', {
    options: {
      'Last 1 hour': 'last1hr',
      'Last 24 hours': 'last24hr',
      'Last 7 days': 'last7d',
      'Last 1 month': 'last1m',
      'All-time': 'alltime',
    },
      });
  pane.addInput(maxSpheres, 'value', { label: 'Max Spheres', min: 1, max: 100 });

  timeFrameSelector.on('change', function(ev) {
      console.log(`change: ${ev.value}`);
      console.log('this', this, this.timeFrame)
      setNewTimeStamp(ev.value);
    }
  );
};

function setNewTimeStamp(value) {
  timeFrame.timestamp = value;
  fetchData();
}

function getPositionBasedOnDifficulty(difficulty) {
  const minDistance = 10 // Minimum distance between spheres
  const maxDistance = 15 // Maximum distance from the center

  const angle = getRandomNumber(0, 2 * Math.PI)
  const distanceFromCenter = getRandomNumber(minDistance, maxDistance) - difficulty * 10 // Adjust the scaling factor as per your requirement

  const x = distanceFromCenter * Math.cos(-angle) // Negate the angle to spin clockwise
  const y = distanceFromCenter * Math.sin(-angle) // Negate the angle to spin clockwise
  const z = 0
  return [x, y, z]
}

function getPositionBasedOnAngle(angle, distanceFromCenter, rotation) {
  const x = distanceFromCenter * Math.cos(-angle + rotation[0]) // Negate the angle to spin clockwise
  const y = distanceFromCenter * Math.sin(-angle + rotation[1]) // Negate the angle to spin clockwise
  const z = distanceFromCenter * Math.cos(-angle + rotation[2]) // Negate the angle to spin clockwise
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
  // Scale the difficulty value to a desired range of radius values
  const minDifficulty = 0.000001
  const maxDifficulty = 5
  const minRadius = 0.1
  const maxRadius = 2.5

  // Map the difficulty value from its range to the radius range using a linear interpolation formula
  const scaledRadius =
    ((difficulty - minDifficulty) * (maxRadius - minRadius)) /
    (maxDifficulty - minDifficulty) +
    minRadius

  // Limit the number of decimal places to 2
  const scaledRadiusLimited = parseFloat(scaledRadius.toFixed(2))

  return scaledRadiusLimited
}
function checkCollision(newPosition, currentSphere, index) {
  const collisionRadius = currentSphere.sphereRadius * 2; // Adjust the collision radius as per your requirement

  for (let i = 0; i < rankings.value.length; i++) {
    if (i !== index) {
      const otherSphere = rankings.value[i];

      // Calculate AABBs for the current sphere and the other sphere
      const currentAABB = {
        minX: currentSphere.position[0] - collisionRadius,
        maxX: currentSphere.position[0] + collisionRadius,
        minY: currentSphere.position[1] - collisionRadius,
        maxY: currentSphere.position[1] + collisionRadius,
        minZ: currentSphere.position[2] - collisionRadius,
        maxZ: currentSphere.position[2] + collisionRadius,
      };

      const otherAABB = {
        minX: otherSphere.position[0] - collisionRadius,
        maxX: otherSphere.position[0] + collisionRadius,
        minY: otherSphere.position[1] - collisionRadius,
        maxY: otherSphere.position[1] + collisionRadius,
        minZ: otherSphere.position[2] - collisionRadius,
        maxZ: otherSphere.position[2] + collisionRadius,
      };

      // Check for AABB intersection
      if (
        currentAABB.minX <= otherAABB.maxX &&
        currentAABB.maxX >= otherAABB.minX &&
        currentAABB.minY <= otherAABB.maxY &&
        currentAABB.maxY >= otherAABB.minY &&
        currentAABB.minZ <= otherAABB.maxZ &&
        currentAABB.maxZ >= otherAABB.minZ
      ) {
        return true; // Collision detected
      }
    }
  }

  return false; // No collision detected
}
</script>
