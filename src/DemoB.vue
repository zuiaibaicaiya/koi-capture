<script setup lang="ts">
import {onMounted, shallowRef, useTemplateRef} from "vue";
import {
  Canvas,
  PencilBrush,
  Point,
  Rect,
  Shadow,
  Text,
  TPointerEventInfo,
  FabricImage
} from "fabric";

const domCanvas = useTemplateRef<HTMLCanvasElement>('domCanvas');
const toolbar = useTemplateRef<HTMLDivElement>('toolbar');
const canvas = shallowRef<Canvas>();
const downPoint = shallowRef<Point>(new Point()) // 按下鼠标时的坐标
const upPoint = shallowRef<Point>(new Point()) // 按下鼠标时的坐标
const movePoint = shallowRef<Point>(new Point()) // 松开鼠标时的坐标
const isMouseDown = shallowRef(false);
const isInit = shallowRef(false);
const {width, height} = window.screen;
const clipPath = new Rect({
  absolutePositioned: true,
  centeredScaling: true,
  inverted: true,
  objectCaching: false,
});
const mask = new Rect({
  width: width,
  height: height,
  fill: 'rgba(0, 0, 0, 0.5)',
  selectable: false,
  clipPath
})
const rect = new Rect({
  width: 0,
  height: 0,
  fill: 'transparent',
  stroke: 'green',
  strokeWidth: 1,
  centeredScaling: true,
  lockRotation: true,
  objectCaching: false,
})
rect.setControlVisible('mtr', false)
onMounted(() => {
  init();
});
window.electronAPI?.setImg((png: Uint8Array, startTime: number) => {
  const bgUrl = URL.createObjectURL(new Blob([png], {type: 'image/png'}));
  FabricImage.fromURL(bgUrl).then(img => {
    img.scaleToWidth(width)
    img.scaleToHeight(height)
    canvas.value!.backgroundImage = img;
    canvas.value?.renderAll();
  })
  const text = new Text(String(new Date().getTime() - startTime), {fill: 'red'})
  canvas.value?.add(text);
})

async function init() {
  if (domCanvas.value) {
    canvas.value = new Canvas(domCanvas.value, {
      width: width,
      height: height,
      fill: 'rgba(0, 0, 0, 0.5)',
    });
  }
  if (canvas.value) {
    canvas.value.hoverCursor = 'crosshair'; //默认光标改成十字
    canvas.value?.add(mask)
    canvas.value!.add(rect)

    canvas.value!.selectionColor = 'transparent' // 选框填充色：透明
    canvas.value!.selectionBorderColor = 'rgba(0, 0, 0, 0)' // 选框边框颜色：透明度很低的黑色（看上去是灰色）
    // canvas.value!.skipTargetFind = true // 禁止选中

    function canvasMouseDown(e: TPointerEventInfo) {
      isMouseDown.value = true;
      downPoint.value = e.scenePoint
    }

    function canvasMouseUp(e: TPointerEventInfo) {
      if (!isInit.value) {
        toolbar.value!.style.cssText = `left:${rect.left}px;top:${rect.top + rect.height + 10}px;display:block`
      }
      isMouseDown.value = false
      isInit.value = true
      canvas.value?.setActiveObject(rect)
      upPoint.value = e.scenePoint
    }

    function canvasMouseMove(e: TPointerEventInfo) {
      if (!isMouseDown.value || isInit.value) {
        return;
      }
      movePoint.value = e.scenePoint;
      const option = {
        top: Math.min(downPoint.value.y, movePoint.value.y),
        left: Math.min(downPoint.value.x, movePoint.value.x),
        width: Math.abs(movePoint.value.x - downPoint.value.x),
        height: Math.abs(movePoint.value.y - downPoint.value.y),
      }
      clipPath.set(option)
      rect.set(option)
      canvas.value!.renderAll();
      toolbar.value!.style.cssText = `left:${rect.left}px;top:${rect.top + rect.height + 10}px`
    }

    canvas.value?.on({
      'object:moving': (e) => {
        const option = {
          left: e.target.left,
          top: e.target.top,
        }
        clipPath.set(option)
        rect.set(option)
        toolbar.value!.style.cssText = `left:${rect.left}px;top:${option.top + rect.getScaledHeight() + 10}px;display:block`
      },
      'object:scaling': (e) => {
        const option = {
          left: e.target.left,
          top: e.target.top,
          scaleX: e.target?.scaleX,
          scaleY: e.target?.scaleY,
        }
        clipPath.set(option)
        rect.set(option)
        toolbar.value!.style.cssText = `left:${option.left}px;top:${option.top + rect.getScaledHeight() + 10}px;display:block`
      },
      'mouse:move': canvasMouseMove,
      'mouse:down': canvasMouseDown,
      'mouse:up': canvasMouseUp,
    });

    canvas.value!.renderAll();
  }
}

function freeDraw() {
  if (canvas.value) {
    canvas.value?.set({isDrawingMode: true})
    const pencilBrush = new PencilBrush(canvas.value);
    pencilBrush.width = 10;
    pencilBrush.shadow = new Shadow({
      blur: 10, // 羽化程度
      // offsetX: 10, // x轴偏移量
      // offsetY: 10, // y轴偏移量
      color: '#b630e3' // 投影颜色
    })
    canvas.value!.freeDrawingBrush = pencilBrush;
  }
}

</script>

<template>
  <div ref="toolbar" class="toolbar">
    <a-button type="primary" @click="freeDraw">自由绘制</a-button>
  </div>
  <canvas ref="domCanvas"></canvas>
</template>

<style scoped>
.toolbar {
  position: fixed;
  z-index: 9999;
  display: none;
}
</style>