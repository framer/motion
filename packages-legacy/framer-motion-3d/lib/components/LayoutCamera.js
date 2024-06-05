import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { mergeRefs } from "react-merge-refs";
import { motion } from "../render/motion";
import { useLayoutCamera } from "./use-layout-camera";
import { extend } from "@react-three/fiber";
extend({ PerspectiveCamera: PerspectiveCameraImpl });
/**
 * Adapted from https://github.com/pmndrs/drei/blob/master/src/core/PerspectiveCamera.tsx
 */
export const LayoutCamera = forwardRef((props, ref) => {
    const { cameraRef } = useLayoutCamera(props, (size) => {
        const { current: cam } = cameraRef;
        if (cam && !props.manual) {
            cam.aspect = size.width / size.height;
            cam.updateProjectionMatrix();
        }
    });
    return (_jsx(motion.perspectiveCamera, Object.assign({ ref: mergeRefs([cameraRef, ref]) }, props)));
});
//# sourceMappingURL=LayoutCamera.js.map