import { VisualElement } from "../../render/types";
import { MotionProps } from "../types";
import { FeatureBundle } from "./types";
/**
 * Load features via renderless components based on the provided MotionProps.
 */
export declare function useFeatures(props: MotionProps, visualElement?: VisualElement, preloadedFeatures?: FeatureBundle): null | JSX.Element[];
