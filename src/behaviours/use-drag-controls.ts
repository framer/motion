import { useConstant } from "../utils/use-constant"
import { DragControls, DragControlOptions } from "./DragControls"

export class GroupDragControls {
    private componentControls = new Set<DragControls>()

    subscribe(controls: DragControls): () => void {
        this.componentControls.add(controls)

        return () => this.componentControls.delete(controls)
    }

    start(
        event:
            | React.MouseEvent
            | React.TouchEvent
            | React.PointerEvent
            | MouseEvent
            | TouchEvent
            | PointerEvent,
        options?: DragControlOptions
    ) {
        // TODO: Add drag options
        this.componentControls.forEach(controls =>
            controls.start(
                (event as React.MouseEvent).nativeEvent || event,
                options
            )
        )
    }
}

const createDragControls = () => new GroupDragControls()

export function useDragControls() {
    return useConstant(createDragControls)
}
