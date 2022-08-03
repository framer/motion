import type { Box } from "framer-motion"
import { RefObject, useContext, useLayoutEffect, useRef } from "react"
import { Size, useThree } from "@react-three/fiber"
import { LayoutCameraProps } from "./types"
import { useVisualElementContext } from "framer-motion"
import { MotionCanvasContext } from "./MotionCanvasContext"
import { invariant } from "hey-listen"
import { calcLength } from "framer-motion"
import { clamp } from "popmotion"

const calcBoxSize = ({ x, y }: Box) => ({
    width: calcLength(x),
    height: calcLength(y),
    top: 0,
    left: 0,
})

export function useLayoutCamera<CameraType>(
    { makeDefault = true }: LayoutCameraProps,
    updateCamera: (size: Size) => void
) {
    const context = useContext(MotionCanvasContext)
    invariant(
        Boolean(context),
        "No MotionCanvas detected. Replace Canvas from @react-three/fiber with MotionCanvas from framer-motion."
    )

    const { dimensions, layoutCamera, requestedDpr } = context!

    const advance = useThree((three) => three.advance)
    const set = useThree((three) => three.set)
    const camera = useThree((three) => three.camera)
    const size = useThree((three) => three.size)
    const gl = useThree((three) => three.gl)
    const parentVisualElement = useVisualElementContext()
    const measuredLayoutSize = useRef<Size>()

    useLayoutEffect(() => {
        measuredLayoutSize.current = size
        updateCamera(size)
        advance(performance.now())

        const projection = parentVisualElement?.projection
        if (!projection) return

        /**
         * When the projection of an element changes we want to update the camera
         * with the projected dimensions.
         */
        const removeProjectionUpdateListener = projection.addEventListener(
            "projectionUpdate",
            (newProjection: Box) => updateCamera(calcBoxSize(newProjection))
        )

        /**
         * When the layout of an element changes we want to update the renderer
         * output to match the layout dimensions.
         */
        const removeLayoutMeasureListener = projection.addEventListener(
            "measure",
            (newLayout: Box) => {
                const newSize = calcBoxSize(newLayout)

                let dpr = requestedDpr
                const { width, height } = dimensions.current!.size!

                const xScale = width / newSize.width
                const yScale = height / newSize.height
                const maxScale = Math.max(xScale, yScale)
                dpr = clamp(0.75, 4, maxScale)

                dimensions.current = {
                    size: { width: newSize.width, height: newSize.height },
                    dpr,
                }

                gl.setSize(newSize.width, newSize.height)
                gl.setPixelRatio(dpr)
            }
        )

        /**
         * When a projection animation completes we want to update the camera to
         * match the recorded layout of the element.
         */
        const removeAnimationCompleteListener = projection.addEventListener(
            "animationComplete",
            () => {
                const { actual } = projection.layout || {}

                if (actual) {
                    setTimeout(() => {
                        const newSize = calcBoxSize(actual)
                        updateCamera(newSize)

                        dimensions.current = { size: newSize }

                        gl.setSize(newSize.width, newSize.height)
                        gl.setPixelRatio(requestedDpr)
                    }, 50)
                }
            }
        )

        return () => {
            removeProjectionUpdateListener()
            removeLayoutMeasureListener()
            removeAnimationCompleteListener()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useLayoutEffect(() => {
        const { current: cam } = layoutCamera

        if (makeDefault && cam) {
            const oldCam = camera
            set(() => ({ camera: cam as any }))
            return () => set(() => ({ camera: oldCam }))
        }
    }, [camera, layoutCamera, makeDefault, set])

    return { size, camera, cameraRef: layoutCamera as RefObject<CameraType> }
}
