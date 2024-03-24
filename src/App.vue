<script setup lang="ts">
import WebcamCapture from '@/components/WebcamCapture.vue'
import { onMounted, ref } from 'vue';
import { initFlowbite } from 'flowbite';

// const myNumber = ref('')

onMounted(() => {
  initFlowbite();
})
</script>

<template>
  <main class="mx-auto bg-slate-500 flex h-screen items-center justify-center">
    <div class="overflow-y-auto">
      <h1 class="text-4xl font-serif text-white">Predict Car plate number</h1>
      <!-- <input v-model="myNumber" type="text" class="my-4 p-4 w-96 rounded" placeholder="Enter car plate number..." /> -->
      <WebcamCapture />
    </div>
  </main>
</template>