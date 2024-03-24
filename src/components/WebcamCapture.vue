<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const facingMode = ref('user'); // 'user'는 전면 카메라, 'environment'는 후면 카메라

// facingMode를 전환하는 함수
function toggleCamera() {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  // 카메라 전환 로직...
}

const myNumber = ref<string[]>([''])
const duration = ref<number>(0)
const video = ref<HTMLVideoElement>()
const canvas = ref<HTMLElement>()
const preview = ref<string>('')
const capture = async () => {
  isProgress.value = true;
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
    const data = await response.json();
    console.log(data);

    const results = extractOcrResults(data.result);
    console.log(results);
    myNumber.value = results;

    const endTime = Date.now(); // 처리 완료 시간 측정
    const _duration = endTime - startTime; // 처리 시간 계산 (밀리초 단위)
    console.log(`Processing time: ${_duration} ms`); // 처리 시간 출력
    duration.value = _duration;
    isProgress.value = false;
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


const inputText2 = `[2024/03/25 01:53:38] ppocr INFO: **********temp.jpg**********
[2024/03/25 01:53:38] ppocr DEBUG: dt_boxes num : 5, elapsed : 0.05205082893371582
--
[2024/03/25 01:53:38] ppocr INFO: [[[206.0, 3.0], [235.0, 3.0], [235.0, 13.0], [206.0, 13.0]], ('수다고고', 0.5480545163154602)]
[2024/03/25 01:53:38] ppocr INFO: [[[86.0, 25.0], [97.0, 25.0], [97.0, 34.0], [86.0, 34.0]], ('5', 0.6674025058746338)]
[2024/03/25 01:53:38] ppocr INFO: [[[132.0, 43.0], [175.0, 35.0], [178.0, 48.0], [135.0, 56.0]], ('900gECOT', 0.8420403003692627)]
[2024/03/25 01:53:38] ppocr INFO: [[[97.0, 122.0], [165.0, 137.0], [155.0, 179.0], [86.0, 164.0]], ('123가:', 0.8158632516860962)]
[2024/03/25 01:53:38] ppocr INFO: [[[162.0, 132.0], [240.0, 145.0], [231.0, 195.0], [153.0, 183.0]], ('4568', 0.9997968673706055)]
`

const inputText3 = `[2024/03/25 01:52:55] ppocr INFO: **********temp.jpg**********
[2024/03/25 01:52:55] ppocr DEBUG: dt_boxes num : 10, elapsed : 0.053949832916259766
--
[2024/03/25 01:52:56] ppocr INFO: [[[81.0, 123.0], [140.0, 120.0], [143.0, 148.0], [84.0, 151.0]], ('31가', 0.9991834163665771)]
[2024/03/25 01:52:56] ppocr INFO: [[[130.0, 121.0], [193.0, 114.0], [196.0, 142.0], [133.0, 148.0]], ('1234', 0.9999620914459229)]
[2024/03/25 01:52:56] ppocr INFO: [[[81.0, 153.0], [93.0, 153.0], [93.0, 167.0], [81.0, 167.0]], ('소', 0.6374487280845642)]
`

const inputText4 = `[2024/03/25 01:52:38] ppocr INFO: **********temp.jpg**********
[2024/03/25 01:52:38] ppocr DEBUG: dt_boxes num : 9, elapsed : 0.04919171333312988
--
[2024/03/25 01:52:39] ppocr INFO: [[[143.0, 57.0], [170.0, 57.0], [170.0, 67.0], [143.0, 67.0]], ('내클:E0T', 0.5984201431274414)]
[2024/03/25 01:52:39] ppocr INFO: [[[106.0, 76.0], [130.0, 76.0], [130.0, 87.0], [106.0, 87.0]], ('모브면', 0.6324412226676941)]
[2024/03/25 01:52:39] ppocr INFO: [[[112.0, 109.0], [206.0, 112.0], [205.0, 143.0], [111.0, 140.0]], ('12가3456', 0.9995041489601135)]
[2024/03/25 01:52:39] ppocr INFO: [[[132.0, 174.0], [148.0, 174.0], [148.0, 186.0], [132.0, 186.0]], ('몸도', 0.9978936314582825)]
[2024/03/25 01:52:39] ppocr INFO: [[[156.0, 172.0], [199.0, 176.0], [198.0, 190.0], [155.0, 186.0]], ('지랑든트번호', 0.6488545536994934)]
[2024/03/25 01:52:39] ppocr INFO: [[[106.0, 199.0], [121.0, 199.0], [121.0, 206.0], [106.0, 206.0]], ('나전남', 0.6040175557136536)]
`


const results = extractOcrResults(inputText);
console.log(results);

const reults2 = extractOcrResults(inputText2);
console.log(reults2);

const reults3 = extractOcrResults(inputText3);
console.log(reults3);

const reults4 = extractOcrResults(inputText4);
console.log(reults4);

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
      facingMode: facingMode.value
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

        // if (actualWidth) {
        //   video.value.width = actualWidth;
        // }
        // if (actualHeight) {
        //   video.value.height = actualHeight;
        // }
      }
    });
})

// const isPlaying = computed(() => {
//   const _video = video.value as HTMLVideoElement;
//   if (_video) {
//     return !_video.paused && !_video.ended && _video.readyState > 2;
//   }
//   return false;
// })

const isPlaying = ref(false)
const isProgress = ref(false)

const playVideo = () => {
  const _video = video.value as HTMLVideoElement;
  if (_video) {
    _video.play().catch(e => console.error('Error playing the video:', e));
    isPlaying.value = true;
  }
}

const pauseVideo = () => {
  const _video = video.value as HTMLVideoElement;
  if (_video) {
    _video.pause();
    isPlaying.value = false;
  }
}
// url placeholder 320x240
// const url = 'https://placekitten.com/320/240'
</script>

<template>
  <div class="flex flex-col bg-slate-100 rounded justify-center items-center">
    <p>{{ resolution }}</p>
    <div class="relative">
      <video playsinline class="border-2 rounded-xl w-full max-w-xs h-auto" ref="video" muted></video>
      <!-- <img src="https://via.placeholder.com/320x240" alt="Kitten" class="rounded-xl w-full max-w-xs h-auto" /> -->
      <div class="absolute bottom-1 flex w-full">
        <button v-if="!isPlaying"
          class="mx-auto text-white rounded-full bg-green-500 hover:bg-green-600 w-8 h-8 font-bold font-serif opacity-50"
          @click="playVideo"></button>
        <button v-else
          class="mx-auto text-white rounded-full bg-red-500 hover:bg-red-600 w-8 h-8 font-bold font-serif  opacity-50"
          @click="pauseVideo"></button>
      </div>
      <div class="absolute top-1 right-1 flex" v-if="isPlaying">
        <button
          class="mx-auto text-white rounded-full bg-slate-500 hover:bg-slate-600 w-8 h-8 font-bold font-serif opacity-50"
          @click="toggleCamera"></button>
      </div>
    </div>
    <button v-if="isPlaying"
      class="mx-auto text-white rounded bg-blue-500 hover:bg-blue-600 p-2 text-lg font-bold font-serif"
      @click="capture">Capture</button>
    <canvas ref="canvas" width="320" height="240" style="display: none;"></canvas>
    <!-- 이미지 미리보기를 위한 img 태그 추가 -->
    <div v-if="!isProgress && preview.length > 0">
      <img v-if="preview.length > 0" :src="preview" alt="Captured image"
        class="mt-4 rounded-xl grayscale  w-full max-w-xs h-auto" />
      <div>
        <p class="text-xl font-bold">Car plate number:</p>
        <ul class="pl-4">
          <li v-if="myNumber.length === 0">No results</li>
          <li v-else v-for="number in myNumber" :key="number">{{ number }}</li>
        </ul>
        <p class="text-xl font-bold">Duration : {{ duration }} ms</p>
      </div>
    </div>
  </div>
  <!-- modal inprogress -->
  <div v-if="isProgress" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white p-4 rounded-lg">
      <p class="text-xl font-bold">Processing...</p>
    </div>
  </div>
</template>
