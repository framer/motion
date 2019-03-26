const order = ["whileHover", "whileTap", "whileDrag"]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
