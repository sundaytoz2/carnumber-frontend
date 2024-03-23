<template>
  <div>
    <video ref="video" width="640" height="480" autoplay></video>
    <button @click="capture">Capture</button>
    <canvas ref="canvas" width="640" height="480" style="display: none;"></canvas>
  </div>
</template>

<script>
export default {
  name: 'WebcamCapture',
  methods: {
    async capture() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async blob => {
        const formData = new FormData();
        formData.append('file', blob);

        const response = await fetch('http://localhost:8000/upload/', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();
        console.log(result);
        alert(result.result);
      });
    }
  },
  mounted() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.$refs.video.srcObject = stream;
      });
  }
};
</script>
