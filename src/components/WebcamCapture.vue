<script setup lang="ts">
import { ref, onMounted } from 'vue'

const myNumber = ref<string[]>([''])
const duration = ref<number>(0)
const video = ref<HTMLElement>()
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

    const response = await fetch('http://localhost:8000/upload/', {
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
      }
    });
})
</script>

<template>
  <div class="flex flex-col bg-slate-100 rounded justify-center items-center">
    <video class="mt-4 rounded-xl" ref="video" width="320" height="240" autoplay></video>
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

<!--
[2024/03/24 16:46:16] ppocr DEBUG: Namespace(help='==SUPPRESS==', use_gpu=False, use_xpu=False, use_npu=False, ir_optim=True, use_tensorrt=False, min_subgraph_size=15, precision='fp32', gpu_mem=500, gpu_id=0, image_dir='temp.jpg', page_num=0, det_algorithm='DB', det_model_dir='/home/choigawoon/.paddleocr/whl/det/ml/Multilingual_PP-OCRv3_det_infer', det_limit_side_len=960, det_limit_type='max', det_box_type='quad', det_db_thresh=0.3, det_db_box_thresh=0.6, det_db_unclip_ratio=1.5, max_batch_size=10, use_dilation=False, det_db_score_mode='fast', det_east_score_thresh=0.8, det_east_cover_thresh=0.1, det_east_nms_thresh=0.2, det_sast_score_thresh=0.5, det_sast_nms_thresh=0.2, det_pse_thresh=0, det_pse_box_thresh=0.85, det_pse_min_area=16, det_pse_scale=1, scales=[8, 16, 32], alpha=1.0, beta=1.0, fourier_degree=5, rec_algorithm='SVTR_LCNet', rec_model_dir='/home/choigawoon/.paddleocr/whl/rec/korean/korean_PP-OCRv4_rec_infer', rec_image_inverse=True, rec_image_shape='3, 48, 320', rec_batch_num=6, max_text_length=25, rec_char_dict_path='/home/choigawoon/miniconda3/envs/carnumber_paddleocr/lib/python3.10/site-packages/paddleocr/ppocr/utils/dict/korean_dict.txt', use_space_char=True, vis_font_path='./doc/fonts/simfang.ttf', drop_score=0.5, e2e_algorithm='PGNet', e2e_model_dir=None, e2e_limit_side_len=768, e2e_limit_type='max', e2e_pgnet_score_thresh=0.5, e2e_char_dict_path='./ppocr/utils/ic15_dict.txt', e2e_pgnet_valid_set='totaltext', e2e_pgnet_mode='fast', use_angle_cls=False, cls_model_dir='/home/choigawoon/.paddleocr/whl/cls/ch_ppocr_mobile_v2.0_cls_infer', cls_image_shape='3, 48, 192', label_list=['0', '180'], cls_batch_num=6, cls_thresh=0.9, enable_mkldnn=False, cpu_threads=10, use_pdserving=False, warmup=False, sr_model_dir=None, sr_image_shape='3, 32, 128', sr_batch_num=1, draw_img_save_dir='./inference_results', save_crop_res=False, crop_res_save_dir='./output', use_mp=False, total_process_num=1, process_id=0, benchmark=False, save_log_path='./log_output/', show_log=True, use_onnx=False, output='./output', table_max_len=488, table_algorithm='TableAttn', table_model_dir=None, merge_no_span_structure=True, table_char_dict_path=None, layout_model_dir=None, layout_dict_path=None, layout_score_threshold=0.5, layout_nms_threshold=0.5, kie_algorithm='LayoutXLM', ser_model_dir=None, re_model_dir=None, use_visual_backbone=True, ser_dict_path='../train_data/XFUND/class_list_xfun.txt', ocr_order_method=None, mode='structure', image_orientation=False, layout=True, table=True, ocr=True, recovery=False, use_pdf2docx_api=False, invert=False, binarize=False, alphacolor=(255, 255, 255), lang='korean', det=True, rec=True, type='ocr', ocr_version='PP-OCRv4', structure_version='PP-StructureV2')
[2024/03/24 16:46:17] ppocr INFO: **********temp.jpg**********
[2024/03/24 16:46:18] ppocr DEBUG: dt_boxes num : 0, elapsed : 0.10128092765808105
[2024/03/24 16:46:18] ppocr DEBUG: rec_res num  : 0, elapsed : 7.152557373046875e-07
-->