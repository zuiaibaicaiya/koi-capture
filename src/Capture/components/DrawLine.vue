<script setup lang="ts">
import { Canvas, Line, TPointerEventInfo } from 'fabric';
import { inject, ref, ShallowRef } from 'vue'
const isDrawing = ref(false)

const { canvas } = inject('koiCapture') as { canvas: ShallowRef<Canvas> }
drawLine()

function drawLine() {
    let line: Line | null = null
    canvas.value?.on('mouse:down', function (event) {
        isDrawing.value = true
        const pointer = event.scenePoint;
        line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            fill: '#ff0000',//填充颜色
            stroke: '#b630e3',//笔触颜色
            strokeWidth: 5,//笔触宽度
            selectable: false,
        })
        canvas.value?.add(line);

    });
    canvas.value?.on('mouse:move', function (event: TPointerEventInfo) {
        const pointer = event.scenePoint;
        line?.set({
            x2: pointer.x,
            y2: pointer.y,
        })
    })
    canvas.value?.on('mouse:up', () => {
        isDrawing.value = false
        line = null
    })
}

</script>
<template>

</template>