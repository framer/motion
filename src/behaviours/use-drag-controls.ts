import { useConstant } from "../utils/use-constant"
import { DragControls, DragControlOptions } from "./DragControls"

export class GroupDragControls {
    private componentControls = new Set<DragControls>()

    subscribe(controls: DragControls): () => void {
        this.componentControls.add(controls)

        return () => this.componentControls.delete(controls)
    }

    start(
        event: MouseEvent | TouchEvent | PointerEvent,
        options: DragControlOptions
    ) {
        this.componentControls.forEach(controls =>
            controls.start(event, options)
        )
    }

    stop() {
        this.componentControls.forEach(controls => controls.stop())
    }
}

const createDragControls = () => new GroupDragControls()

export function useDragControls() {
    return useConstant(createDragControls)
}
