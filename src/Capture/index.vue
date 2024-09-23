<script setup lang="ts">
import {Canvas, FabricImage, Point, Rect, TPointerEventInfo} from 'fabric';
import {onMounted, provide, ref, ShallowRef, shallowRef, useTemplateRef} from 'vue'
import DrawArrow from './components/DrawArrow.vue';
import DrawLine from './components/DrawLine.vue';

const canvas = shallowRef<Canvas>()
const isInit = ref(false)
const {width, height} = window.screen;
const canvasRef = useTemplateRef('canvasRef')
provide<{ canvas: ShallowRef<Canvas | undefined> }>('koiCapture', {canvas})
onMounted(() => {
  init()
})

function init() {
  canvas.value = new Canvas(canvasRef.value as HTMLCanvasElement, {
    isDrawingMode: false,
    selection: false,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
const downPoint = shallowRef<Point>(new Point()) // 按下鼠标时的坐标
const upPoint = shallowRef<Point>(new Point()) // 松开鼠标时的坐标
const isMouseDown = shallowRef(false);
const mask = shallowRef<Rect>()
drawBg();

function drawBg() {
  window.electronAPI?.setImg((png: Uint8Array) => {
    const bgUrl = URL.createObjectURL(new Blob([png], {type: 'image/png'}));
    const clipPath = new Rect({ width: 0, height:0, top: 0, left: 0, absolutePositioned: true });
    function canvasMouseMove(e: TPointerEventInfo) {
      if (!isMouseDown.value) {
        return;
      }
      upPoint.value = e.scenePoint;
      const option = {
        top: downPoint.value.y,
        left: downPoint.value.x,
        width: upPoint.value.x - downPoint.value.x,
        height: upPoint.value.y - downPoint.value.y
      }
      clipPath.set(option)
      canvas.value!.renderAll();
    }
    function canvasMouseDown(e: TPointerEventInfo) {
      isMouseDown.value = true;
      downPoint.value = e.scenePoint
    }

    function canvasMouseUp() {
      isMouseDown.value = false
    }
    canvas.value!.on('mouse:down', canvasMouseDown)   // 鼠标在画布上按下
    canvas.value!.on('mouse:move', canvasMouseMove)   // 鼠标在画布上按下
    canvas.value!.on('mouse:up', canvasMouseUp)       // 鼠标在画布上松开

    FabricImage.fromURL(bgUrl).then(img => {
      img.clipPath = clipPath;
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
      <DrawArrow/>
      <DrawLine/>
    </template>
  </canvas>
</template>