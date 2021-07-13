import { createProjectionNode } from "./create-projection-node"

export const DocumentProjectionNode = createProjectionNode<Window>({
    attachResizeListener: (
        ref: Window | Element,
        notify: VoidFunction
    ): VoidFunction => {
        ref.addEventListener("resize", notify, { passive: true })
        return () => ref.removeEventListener("resize", notify)
    },
    measureScroll: () => ({
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
    }),
})
