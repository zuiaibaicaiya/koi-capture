<script setup lang="ts">
import { Canvas } from 'fabric';
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
    });
    canvas.value!.selectionColor = 'transparent' // 选框填充色：透明
    canvas.value!.selectionBorderColor = 'rgba(0, 0, 0, 0)' // 选框边框颜色：透明度很低的黑色（看上去是灰色）
    canvas.value!.skipTargetFind = true // 禁止选中
    isInit.value = true
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