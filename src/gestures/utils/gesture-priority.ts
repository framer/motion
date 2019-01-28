const order = ["hover", "tap", "drag"]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
