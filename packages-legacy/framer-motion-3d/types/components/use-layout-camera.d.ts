import { RefObject } from "react";
import { Size } from "@react-three/fiber";
import { LayoutCameraProps } from "./types";
export declare function useLayoutCamera<CameraType>({ makeDefault }: LayoutCameraProps, updateCamera: (size: Size) => void): {
    size: Size;
    camera: import("@react-three/fiber").Camera & {
        manual?: boolean | undefined;
    };
    cameraRef: RefObject<CameraType | null>;
};
