import * as React from "react";
import { VisualElement } from "../../render/types";
import { VisualState } from "./use-visual-state";
/**
 * Creates a ref function that, when called, hydrates the provided
 * external ref and VisualElement.
 */
export declare function useMotionRef<Instance, RenderState>(visualState: VisualState<Instance, RenderState>, visualElement?: VisualElement<Instance> | null, externalRef?: React.Ref<Instance>): React.Ref<Instance>;
