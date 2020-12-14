const order = ["whileFocus", "whileHover", "whileTap", "whileDrag"]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
