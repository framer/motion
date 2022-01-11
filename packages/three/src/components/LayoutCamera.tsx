import * as React from "react"
import { PerspectiveCamera as PerspectiveCameraImpl } from "three"
import mergeRefs from "react-merge-refs"
import { LayoutCameraProps } from "./types"
import { motion } from "../render/motion"
import { useLayoutCamera } from "./use-layout-camera"
import { ThreeMotionProps } from "../types"

type Props = JSX.IntrinsicElements["perspectiveCamera"] &
    LayoutCameraProps &
    ThreeMotionProps

/**
 * Adapted from https://github.com/pmndrs/drei/blob/master/src/core/PerspectiveCamera.tsx
 */
export const LayoutCamera = React.forwardRef((props: Props, ref) => {
    const { cameraRef } = useLayoutCamera<PerspectiveCameraImpl>(
        props,
        (size) => {
            const { current: cam } = cameraRef

            if (cam && !props.manual) {
                cam.aspect = size.width / size.height
                cam.updateProjectionMatrix()
            }
        }
    )

    return (
        <motion.perspectiveCamera
            ref={mergeRefs([cameraRef, ref]) as any}
            {...props}
        />
    )
})
