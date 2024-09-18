<script setup lang="ts">
import { Canvas, Polyline, TPointerEventInfo } from 'fabric';
import { inject, ref, ShallowRef } from 'vue'
const isDrawing = ref(false)

const { canvas } = inject('koiCapture') as { canvas: ShallowRef<Canvas> }
drawArrow()

function drawArrow() {
    let fromx = 0, fromy = 0, tox = 0, toy = 0;
    let polyLine: Polyline | null = null
    canvas.value?.on('mouse:down', function (event: TPointerEventInfo) {
        const pointer = event.scenePoint;
        fromx = pointer.x;
        fromy = pointer.y;
        isDrawing.value = true
    });
    canvas.value?.on('mouse:move', (event: TPointerEventInfo) => {
        if (!isDrawing.value) {
            return
        }
        const pointer = event.scenePoint;
        tox = pointer.x;
        toy = pointer.y;

        const angle = Math.atan2(toy - fromy, tox - fromx);

        const headlen = 10;  // arrow head size

        // bring the line end back some to account for arrow head.
        tox = tox - (headlen) * Math.cos(angle);
        toy = toy - (headlen) * Math.sin(angle);
        // calculate the points.
        const points = [
            {
                x: fromx,  // start point
                y: fromy
            },
            // {
            //   x: fromx - (headlen / 4) * Math.cos(angle - Math.PI / 2),
            //   y: fromy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            // },
            {
                x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            },
            {
                x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
            },
            {
                x: tox + (headlen) * Math.cos(angle),  // tip
                y: toy + (headlen) * Math.sin(angle)
            },
            {
                x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
            },
            {
                x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            },
            // {
            //   x: fromx - (headlen / 4) * Math.cos(angle + Math.PI / 2),
            //   y: fromy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            // },
            {
                x: fromx,
                y: fromy
            }
        ];

        if (!polyLine) {
            const color = 'red'
            const fillColor = 'transparent'
            // const fillColor = 'red'
            polyLine = new Polyline(points, {
                fill: fillColor, //'white',
                stroke: color, //'black',
                strokeWidth: 1,
                selectable: false,
                objectCaching: false,
            });
            canvas.value?.add(polyLine);
        } else {
            Object.assign(polyLine.points, points)
            canvas.value?.renderAll();
            polyLine.setCoords();
        }
    })
    canvas.value?.on('mouse:up', () => {
        isDrawing.value = false
        polyLine = null
    })
}
</script>
<template>

</template>