import {
    MutableRefObject,
    RefObject,
    useContext,
    useLayoutEffect,
    useRef,
} from "react"
import { Size, useThree } from "@react-three/fiber"
import { LayoutCameraProps } from "./types"
import { useVisualElementContext } from "../../context/MotionContext"
import { Box } from "../../projection/geometry/types"
import { MotionCanvasContext } from "./MotionCanvasContext"
import { invariant } from "hey-listen"
import { calcLength } from "../../projection/geometry/delta-calc"
import { getFrameData } from "framesync"

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

    const { setSize, layoutCamera } = context!

    const latestLayout = useRef<Box>(null) as MutableRefObject<Box>
    const advance = useThree((three) => three.advance)
    const set = useThree((three) => three.set)
    const camera = useThree((three) => three.camera)
    const size = useThree((three) => three.size)
    const gl = useThree((three) => three.gl)
    const parentVisualElement = useVisualElementContext()

    useLayoutEffect(() => {
        updateCamera(size)

        const projection = parentVisualElement?.projection
        if (!projection) return

        /**
         * When the projection of an element changes we want to update the camera
         * with the projected dimensions.
         */
        const removeProjectionUpdateListener = projection.addEventListener(
            "projectionUpdate",
            (newProjection: Box) => {
                // TODO: Removed to prevent iOS from crashing.
                // Perhaps a better apporach is to set with setSize
                // and then set to window native on animationComplete.
                // if (latestLayout.current) {
                //     const { x, y } = latestLayout.current
                //     const xRatio = calcLength(newProjection.x) / calcLength(x)
                //     const yRatio = calcLength(newProjection.y) / calcLength(y)
                //     gl.setPixelRatio(
                //         Math.max(xRatio, yRatio) * window.devicePixelRatio
                //     )
                // }
                updateCamera(calcBoxSize(newProjection))
                advance(getFrameData().timestamp)
            }
        )

        /**
         * When the layout of an element changes we want to update the renderer
         * output to match the layout dimensions.
         */
        const removeLayoutMeasureListener = projection.addEventListener(
            "measure",
            (newLayout: Box) => {
                latestLayout.current = newLayout
                const newSize = calcBoxSize(newLayout)
                gl.setSize(newSize.width, newSize.height)
                setSize!(newSize)
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
                actual && updateCamera(calcBoxSize(actual))
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
