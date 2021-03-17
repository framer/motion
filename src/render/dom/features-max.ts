import { drag } from "../../motion/features/drag"
import { layoutAnimations } from "../../motion/features/layout"
import { domAnimation } from "./features-animation"

export const domMax = {
    ...domAnimation,
    ...drag,
    ...layoutAnimations,
}
