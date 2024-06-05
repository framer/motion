import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import { OrthographicCamera as OrthographicCameraImpl } from "three";
import { mergeRefs } from "react-merge-refs";
import { motion } from "../render/motion";
import { useLayoutCamera } from "./use-layout-camera";
import { extend } from "@react-three/fiber";
extend({ OrthographicCamera: OrthographicCameraImpl });
export const LayoutOrthographicCamera = forwardRef((props, ref) => {
    const { size, cameraRef } = useLayoutCamera(props, (newSize) => {
        const { current: cam } = cameraRef;
        if (cam) {
            cam.left = newSize.width / -2;
            cam.right = newSize.width / 2;
            cam.top = newSize.height / 2;
            cam.bottom = newSize.height / -2;
            cam.updateProjectionMatrix();
        }
    });
    return (_jsx(motion.orthographicCamera, Object.assign({ left: size.width / -2, right: size.width / 2, top: size.height / 2, bottom: size.height / -2, ref: mergeRefs([cameraRef, ref]) }, props)));
});
//# sourceMappingURL=LayoutOrthographicCamera.js.map