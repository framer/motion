import * as React from "react"
import { OrthographicCamera as OrthographicCameraImpl } from "three"
import { mergeRefs } from "react-merge-refs"
import { motion } from "../render/motion"
import { LayoutCameraProps } from "./types"
import { useLayoutCamera } from "./use-layout-camera"
import { ThreeMotionProps } from "../types"
import { extend } from "@react-three/fiber"

extend({ OrthographicCamera: OrthographicCameraImpl })

type Props = JSX.IntrinsicElements["orthographicCamera"] &
    LayoutCameraProps &
    ThreeMotionProps

export const LayoutOrthographicCamera = React.forwardRef(
    (props: Props, ref) => {
        const { size, cameraRef } = useLayoutCamera<OrthographicCameraImpl>(
            props,
            (newSize) => {
                const { current: cam } = cameraRef

                if (cam) {
                    cam.left = newSize.width / -2
                    cam.right = newSize.width / 2
                    cam.top = newSize.height / 2
                    cam.bottom = newSize.height / -2
                    cam.updateProjectionMatrix()
                }
            }
        )

        return (
            <motion.orthographicCamera
                left={size.width / -2}
                right={size.width / 2}
                top={size.height / 2}
                bottom={size.height / -2}
                ref={mergeRefs([cameraRef, ref]) as any}
                {...props}
            />
        )
    }
)
