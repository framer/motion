import { MotionProps } from "../../motion/types";
import { ResolvedValues } from "../types";
export declare function useSVGProps(props: MotionProps, visualState: ResolvedValues): {
    style: {
        [x: string]: string | number;
    };
};
