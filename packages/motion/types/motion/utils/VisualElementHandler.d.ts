import React from "react";
import { MotionConfigProps } from "../..";
import { VisualElement } from "../../render/types";
import { MotionProps } from "../types";
interface Props {
    visualElement?: VisualElement;
    props: MotionProps & MotionConfigProps;
}
export declare class VisualElementHandler extends React.Component<Props> {
    /**
     * Update visual element props as soon as we know this update is going to be commited.
     */
    getSnapshotBeforeUpdate(): null;
    componentDidUpdate(): void;
    updateProps(): void;
    render(): React.ReactNode;
}
export {};
