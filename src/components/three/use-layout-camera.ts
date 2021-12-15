import { RefObject, useContext, useLayoutEffect, useRef } from "react"
import { Size, useThree } from "@react-three/fiber"
import { LayoutCameraProps } from "./types"
import { useVisualElementContext } from "../../context/MotionContext"
import { Box } from "../../projection/geometry/types"
import { MotionCanvasContext } from "./MotionCanvasContext"
import { invariant } from "hey-listen"
import { calcLength } from "../../projection/geometry/delta-calc"

const calcBoxSize = ({ x, y }: Box) => ({
    width: calcLength(x),
    height: calcLength(y),
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

    const { dimensions, layoutCamera } = context!

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

                let dpr = window.devicePixelRatio
                const { width, height } = dimensions.current!.size!

                if (newSize.width < width || newSize.height < height) {
                    const xScale = width / newSize.width
                    const yScale = height / newSize.height
                    const maxScale = Math.max(xScale, yScale)
                    dpr = Math.min(maxScale, 8)
                }

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
                        gl.setPixelRatio(window.devicePixelRatio)
                    }, 50)
                }
            }
        )

        return () => {
            removeProjectionUpdateListener()
            removeLayoutMeasureListener()
            removeAnimationCompleteListener()
        }
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
