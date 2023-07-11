<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'
import Markdown from 'vue3-markdown-it';
import Tweet from "vue-tweet";


const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const markdownContent = ref(null)
const urlContent = ref(null)
const tweetId = ref(null)

onMounted(async () => {


  if(props.content.content.content_type === 'text/markdown') {
    markdownContent.value = props.content.content.content_text
  } else if (props?.content?.content.content_type === 'application/json' && props?.content.content.map.type === 'url') {

    const { data } = await useFetch(`https://onchain.sv/api/v1/events/${props?.content.content.txid}`)

    const urlData = data.value


    // Check if url is a Tweet
    if(urlData.events[0].content.url && urlData.events[0].content.url.includes('twitter.com')) {
      tweetId.value = urlData.events[0].content.url.split('/').pop()
    }


    else if(urlData) {
    const previewLinkTest = await useFetch('/api/preview', {
    query: {
        url: urlData.events[0].content.url,
      }
    })


  if(previewLinkTest.data) {

    urlContent.value = previewLinkTest.data.value


    }
  }
}

})

</script>

<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<template>
  <Teleport to="body">
    <div class="modal">
      <div class="modal__backdrop" @click="$emit('close')" />
      <dialog
        class="modal__dialog rounded-xl bg-white text-black" :aria-label="props.content?.txid" role="alertdialog" aria-modal="true" open
        @keyup.esc.prevent="$emit('close')"
      >

        <div>
          <div class="q-pa-md boostpow-dialog w-full text-center md:w-md">
            <div v-if="markdownContent"  class="mb-4 flex items-center">
              <Markdown :source="markdownContent" />
            </div>
            <div v-if="tweetId"  class="mb-4 flex items-center">

              <Tweet :tweet-id="tweetId" />
            </div>
            <div v-if="urlContent"  class="mb-4 flex items-center">
              <LinkPreview :preview="urlContent.preview" />
            </div>
          </div>
        </div>
      </dialog>
    </div>d
  </Teleport>
</template>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  padding: 5%;
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
  padding: 1rem;
  border: 0;
  margin: 0;
}

img {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}
</style>
