import { useConstant } from "../utils/use-constant"
import { DragControls } from "./DragControls"

export class GroupDragControls {
    private componentControls = new Set<DragControls>()

    subscribe(controls: DragControls): () => void {
        this.componentControls.add(controls)

        return () => this.componentControls.delete(controls)
    }

    start(event: MouseEvent | TouchEvent | PointerEvent) {
        // TODO: Add drag options
        this.componentControls.forEach(controls => controls.start(event))
    }
}

const createDragControls = () => new GroupDragControls()

export function useDragControls() {
    return useConstant(createDragControls)
}
