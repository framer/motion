import { frame } from "../../frameloop"

export async function nextFrame() {
    return new Promise<void>((resolve) => {
        frame.render(() => resolve())
    })
}
