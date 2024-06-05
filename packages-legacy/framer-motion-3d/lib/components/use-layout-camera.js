import { useContext, useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { MotionContext } from "framer-motion";
import { MotionCanvasContext } from "./MotionCanvasContext";
import { calcLength, clamp, invariant } from "framer-motion";
const calcBoxSize = ({ x, y }) => ({
    width: calcLength(x),
    height: calcLength(y),
    top: 0,
    left: 0,
});
export function useLayoutCamera({ makeDefault = true }, updateCamera) {
    const context = useContext(MotionCanvasContext);
    invariant(Boolean(context), "No MotionCanvas detected. Replace Canvas from @react-three/fiber with MotionCanvas from framer-motion.");
    const { dimensions, layoutCamera, requestedDpr } = context;
    const advance = useThree((three) => three.advance);
    const set = useThree((three) => three.set);
    const camera = useThree((three) => three.camera);
    const size = useThree((three) => three.size);
    const gl = useThree((three) => three.gl);
    const { visualElement: parentVisualElement } = useContext(MotionContext);
    const measuredLayoutSize = useRef(undefined);
    useLayoutEffect(() => {
        measuredLayoutSize.current = size;
        updateCamera(size);
        advance(performance.now());
        const projection = parentVisualElement === null || parentVisualElement === void 0 ? void 0 : parentVisualElement.projection;
        if (!projection)
            return;
        /**
         * When the projection of an element changes we want to update the camera
         * with the projected dimensions.
         */
        const removeProjectionUpdateListener = projection.addEventListener("projectionUpdate", (newProjection) => updateCamera(calcBoxSize(newProjection)));
        /**
         * When the layout of an element changes we want to update the renderer
         * output to match the layout dimensions.
         */
        const removeLayoutMeasureListener = projection.addEventListener("measure", (newLayout) => {
            const newSize = calcBoxSize(newLayout);
            let dpr = requestedDpr;
            const { width, height } = dimensions.current.size;
            const xScale = width / newSize.width;
            const yScale = height / newSize.height;
            const maxScale = Math.max(xScale, yScale);
            dpr = clamp(0.75, 4, maxScale);
            dimensions.current = {
                size: { width: newSize.width, height: newSize.height },
                dpr,
            };
            gl.setSize(newSize.width, newSize.height);
            gl.setPixelRatio(dpr);
        });
        /**
         * When a projection animation completes we want to update the camera to
         * match the recorded layout of the element.
         */
        const removeAnimationCompleteListener = projection.addEventListener("animationComplete", () => {
            const { layoutBox } = projection.layout || {};
            if (layoutBox) {
                setTimeout(() => {
                    const newSize = calcBoxSize(layoutBox);
                    updateCamera(newSize);
                    dimensions.current = { size: newSize };
                    gl.setSize(newSize.width, newSize.height);
                    gl.setPixelRatio(requestedDpr);
                }, 50);
            }
        });
        return () => {
            removeProjectionUpdateListener();
            removeLayoutMeasureListener();
            removeAnimationCompleteListener();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useLayoutEffect(() => {
        const { current: cam } = layoutCamera;
        if (makeDefault && cam) {
            const oldCam = camera;
            set(() => ({ camera: cam }));
            return () => set(() => ({ camera: oldCam }));
        }
    }, [camera, layoutCamera, makeDefault, set]);
    return { size, camera, cameraRef: layoutCamera };
}
//# sourceMappingURL=use-layout-camera.js.map