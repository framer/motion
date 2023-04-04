import { sync } from "../frameloop"

export async function frame() {
    return new Promise((resolve) => sync.postRender(resolve))
}
