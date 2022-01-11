/// <reference types="react" />
import { CreateVisualElement } from "../render/types";
export interface LazyContextProps {
    renderer?: CreateVisualElement<any>;
    strict: boolean;
}
export declare const LazyContext: import("react").Context<LazyContextProps>;
