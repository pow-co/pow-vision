<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
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
            <div class="mb-4 flex items-center">
              <div class="font-bolder ml-2 text-lg font-medium">
                Boostpow
              </div>
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
