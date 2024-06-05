import * as React from "react";
import { Props } from "@react-three/fiber";
export interface MotionCanvasProps extends Omit<Props, "resize"> {
}
export declare const MotionCanvas: React.ForwardRefExoticComponent<MotionCanvasProps & React.RefAttributes<HTMLCanvasElement>>;
