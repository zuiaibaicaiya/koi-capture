<script setup lang="ts">
import { Canvas, FabricImage } from 'fabric';
import { onMounted, provide, ref, ShallowRef, shallowRef, useTemplateRef } from 'vue'
import DrawArrow from './components/DrawArrow.vue';
import DrawLine from './components/DrawLine.vue';

const canvas = shallowRef<Canvas>()
const isInit = ref(false)
const { width, height } = window.screen;
const canvasRef = useTemplateRef('canvasRef')
provide<{ canvas: ShallowRef<Canvas | undefined> }>('koiCapture', { canvas })
onMounted(() => {
  init()
})

function init() {
  canvas.value = new Canvas(canvasRef.value as HTMLCanvasElement, {
    isDrawingMode: false,
    selection: false,
    width: width,
    height: height,
    // backgroundColor: 'transparent',
    // overlayColor: 'transparent'
  });
  canvas.value!.selectionColor = 'transparent' // 选框填充色：透明
  canvas.value!.selectionBorderColor = 'rgba(0, 0, 0, 0)' // 选框边框颜色：透明度很低的黑色（看上去是灰色）
  canvas.value!.skipTargetFind = true // 禁止选中
  isInit.value = true
  window.electronAPI?.clear(() => {
    canvas.value?.clear();
  })
}
drawBg();
function drawBg() {
  window.electronAPI?.setImg((png: Uint8Array) => {
    const bgUrl = URL.createObjectURL(new Blob([png]));
    FabricImage.fromURL(bgUrl).then(img => {
      img.scaleToWidth(width)
      img.scaleToHeight(height)
      canvas.value!.backgroundImage = img;
      canvas.value!.renderAll();
    })
  })
}
</script>
<template>
  <canvas ref="canvasRef">
    <template v-if="isInit">
      <DrawArrow />
      <DrawLine />
    </template>
  </canvas>
</template>