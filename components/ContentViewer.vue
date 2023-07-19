<template>
  <Teleport to="body">
    <div class="modal">
      <div class="modal__backdrop" @click="$emit('close')" />
      <dialog
        class="modal__dialog rounded-xl bg-white text-black"
        :aria-label="props.content?.txid"
        role="alertdialog"
        aria-modal="true"
        open
        @keyup.esc.prevent="$emit('close')"
      >
        <div class="card">
          <div class="card__header">
            <div class="txid">
              <a :href="`https://pow.co/${props.content?.content.txid}`" target="_blank" rel="noopener">
                TXID: {{ props.content?.content.txid }}
              </a>
            </div>
            <div class="difficulty flex items-center">
              <PureBoostButton wallet="relayx" :content="props.content?.content.txid" :onSending="boostSending" :onSuccess="boostSuccess" :onError="boostError"  />
              {{props.difficulty}} <span class="emoji">⛏️</span>
            </div>
          </div>
          <div class="card__content">
            <div class="boostpow-dialog w-full text-center">
              <div v-if="markdownContent && !isIframeString" class="mb-4 flex items-center">
                <Markdown :source="markdownContent" />
              </div>
              <div v-else-if="markdownContent && isIframeString" v-html="markdownContent">
              </div>
              <div v-else-if="tweetId" class="mb-4 flex items-center">
                <Tweet :tweet-id="tweetId" />
              </div>
              <div v-else-if="urlContent" class="mb-4 flex items-center">
                <LinkPreview :preview="urlContent.preview" />
              </div>
              <div v-else-if="youtubeUrl" class="player">
                  <VueYtframe :videoUrl="youtubeUrl" />
              </div>
              <div v-else-if="imageContents" class="flex items-center">
                <img :src="imageContents" />
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import Markdown from 'vue3-markdown-it';
import Tweet from "vue-tweet";
import { useToast } from 'vue-toastification'
import { BoostButton } from 'boostpow-button'
import { applyPureReactInVue } from 'veaury'

const PureBoostButton = applyPureReactInVue(BoostButton)

const toast = useToast()
const lastBoostedId = ref<number | null>(null)

const boostSending = () => {
  lastBoostedId.value = Math.random()
  toast.info('Attempting to purchase a boost job...', {id: lastBoostedId.value, timeout: 20000})
}

const boostSuccess = () => {
  toast.success('Boost success!')
  toast.dismiss(lastBoostedId.value!)
}

const boostError = (error: any) => {
  toast.error(error.message)
  toast.dismiss(lastBoostedId.value!)
}

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  difficulty: {
    type: Number,
  },
})

const isIframeString = computed(() => {
  const iframeRegex = /^<iframe.*<\/iframe>$/i;
  if (!markdownContent.value) return false;
  return iframeRegex.test(markdownContent.value);
})

const markdownContent = ref(null)
const urlContent = ref(null)
const tweetId = ref(null)
const youtubeUrl = ref(null)
const imageContents = ref<string | null>(null)

onMounted(async () => {
  // toast.success('Hello world!')
  if (props.content.content.content_type === 'text/markdown' || props.content.content.content_type === 'text/plain') {
    markdownContent.value = props.content.content.content_text
  }
  else if (props?.content?.content.content_type === 'application/json' && props?.content.content.map.type === 'url') {
    const { data } = await useFetch(`https://onchain.sv/api/v1/events/${props?.content.content.txid}`)
    const urlData = data.value

    // Check if url is a Tweet
    if (urlData.events[0].content.url && urlData.events[0].content.url.includes('twitter.com')) {
      tweetId.value = urlData.events[0].content.url.split('/').pop()
    }
    // Check if it is a youtube video
    else if (urlData && urlData.events[0].content.url && urlData.events[0].content.url.includes('youtube.com')) {
      youtubeUrl.value = urlData.events[0].content.url
    }
    else if (urlData) {
      const previewLinkTest = await useFetch('/api/preview', {
        query: {
          url: urlData.events[0].content.url,
        }
      })

      if (previewLinkTest.data) {
        urlContent.value = previewLinkTest.data.value
      }
    }
  }
  else if ( props.content.content.content_type === 'image/jpeg' ) {
    imageContents.value = `data:image/jpeg;base64,${props.content.content.content_text}`
  }
})
</script>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center
}

.modal__backdrop {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
}

.modal__dialog {
  display: block;
  position: relative;
  width: auto;
  height: auto;
  overflow-y: auto;
  border: 0;
  margin: 0;
  padding: 0;
  border-radius: 8px;
}

.card {
  width: 100%;
  max-width: 400px;
  border: 1px solid #c548a8;
  border-radius: 8px;
  overflow: hidden;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #d965c7;
  padding: 10px;
}

.txid {
  width: 150px; /* Adjust the width as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.txid a {
  color: #000;
  text-decoration: none;
}

.difficulty {
  font-size: 14px;
  font-weight: bold;
}

.emoji {
  margin-left: 5px;
}

img {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}


.player {
	height: 400px;
	max-width: 600px;
}
</style>
