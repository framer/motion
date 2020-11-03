const order = ["animate", "whileHover", "whileTap", "whileDrag", "exit"]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
