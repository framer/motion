import { sync } from "../../frameloop"

export async function nextFrame() {
    return new Promise<void>((resolve) => {
        sync.render(() => resolve())
    })
}
