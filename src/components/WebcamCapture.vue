<script setup lang="ts">
import { ref, onMounted } from 'vue'

const myNumber = ref<string[]>([''])
const duration = ref<number>(0)
const video = ref<HTMLVideoElement>()
const canvas = ref<HTMLElement>()
const preview = ref<string>('')
const capture = async () => {
  const startTime = Date.now(); // 처리 시작 시간 측정

  const _video = video.value as HTMLVideoElement;
  const _canvas = canvas.value as HTMLCanvasElement;
  if (!_video || !_canvas) {
    return;
  }
  const ctx = _canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.drawImage(_video, 0, 0, _canvas.width, _canvas.height);

  preview.value = _canvas.toDataURL('image/png');
  console.log(`width: ${_canvas.width}, height: ${_canvas.height}`);
  _canvas.toBlob(async blob => {
    const formData = new FormData();
    if (!blob) {
      return;
    }
    formData.append('file', blob);

    // const url = '/api/upload'
    const url = 'https://choigawoon.site/api/upload'
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    console.log(result);

    const results = extractOcrResults(result);
    console.log(results);
    myNumber.value = results;

    const endTime = Date.now(); // 처리 완료 시간 측정
    const _duration = endTime - startTime; // 처리 시간 계산 (밀리초 단위)
    console.log(`Processing time: ${_duration} ms`); // 처리 시간 출력
    duration.value = _duration;
  })
}

function extractOcrResults(input: string): string[] {
  // 정규 표현식을 수정하여 문자열에서 텍스트와 신뢰도 점수를 정확히 찾아냅니다.
  const regex = /\[\[\[.*?\]\], \('([^']+)', (\d+\.\d+)\)\]/g;
  let match;
  const results = [];

  // 문자열에서 모든 일치 항목을 찾습니다.
  while ((match = regex.exec(input))) {
    // 텍스트와 신뢰도 점수를 추출하여 배열에 저장합니다.
    results.push(`('${match[1]}', ${match[2]})`);
  }

  return results;
}

// 예제 입력
const inputText = "[2024/03/24 17:23:40] ppocr INFO: [[[103.0, 144.0], [132.0, 144.0], [132.0, 155.0], [103.0, 155.0]], ('45어:', 0.9024415612220764)]\n" +
  "[2024/03/24 17:23:40] ppocr INFO: [[[128.0, 144.0], [162.0, 144.0], [162.0, 155.0], [128.0, 155.0]], ('2381', 0.9988919496536255)]";

const results = extractOcrResults(inputText);
console.log(results);
myNumber.value = results;
const resolution = ref('')
onMounted(() => {
  navigator.mediaDevices.getUserMedia({
    video: {
      width: {
        min: 1280,
        ideal: 1920,
        max: 2560,
      },
      height: {
        min: 720,
        ideal: 1080,
        max: 1440
      },
      facingMode: 'user'
    }
  })
    .then(stream => {
      if (video.value instanceof HTMLVideoElement) {
        video.value.srcObject = stream;
        // 스트림으로부터 실제 비디오 해상도를 가져옵니다.
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        if (!settings) {
          return;
        }
        const actualWidth = settings.width;
        const actualHeight = settings.height;

        resolution.value = `${actualWidth}x${actualHeight}`;
        console.log(`Actual video resolution: ${actualWidth}x${actualHeight}`)

        // <video> 요소의 크기를 실제 비디오 해상도에 맞춰 조정합니다.
        if (!video.value) {
          return;
        }

        // check if mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) {
          return;
        }

        if (actualWidth) {
          video.value.width = actualWidth;
        }
        if (actualHeight) {
          video.value.height = actualHeight;
        }
      }
    });
})
const playVideo = () => {
  const _video = video.value as HTMLVideoElement;
  if (_video) {
    _video.play().catch(e => console.error('Error playing the video:', e));
  }
}

const pauseVideo = () => {
  const _video = video.value as HTMLVideoElement;
  if (_video) {
    _video.pause();
  }
}
</script>

<template>
  <div class="flex flex-col bg-slate-100 rounded justify-center items-center">
    <p>{{ resolution }}</p>
    <video playsinline class="mt-4 rounded-xl" ref="video" width="320" height="240" autoplay muted></video>
    <div class="flex space-x-2 mt-4">
      <button class="mx-auto text-white rounded bg-blue-500 hover:bg-blue-600 p-2 text-lg font-bold font-serif"
        @click="playVideo">Play</button>
      <button class="mx-auto text-white rounded bg-red-500 hover:bg-red-600 p-2 text-lg font-bold font-serif"
        @click="pauseVideo">Pause</button>
    </div>
    <button class="mt-4 mx-auto text-white rounded bg-blue-500 hover:bg-blue-600 p-4 text-2xl font-bold font-serif"
      @click="capture">Capture</button>
    <canvas ref="canvas" width="320" height="240" style="display: none;"></canvas>
    <!-- 이미지 미리보기를 위한 img 태그 추가 -->
    <img v-if="preview.length > 0" :src="preview" alt="Captured image" class="mt-4 rounded-xl grayscale" />
    <div>
      <p class="text-xl font-bold">Car plate number:</p>
      <ul class="pl-4">
        <li v-if="myNumber.length === 0">No results</li>
        <li v-else v-for="number in myNumber" :key="number">{{ number }}</li>
      </ul>
      <p class="text-xl font-bold">Duration : {{ duration }} ms</p>
    </div>
  </div>
</template>
