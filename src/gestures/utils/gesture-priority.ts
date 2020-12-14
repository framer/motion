const order = [
    "whileFocus",
    "whileHover",
    "whileTap",
    "whileDrag",
    "whileDisable",
]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
