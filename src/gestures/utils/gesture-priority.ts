const order = ["hover", "press", "drag"]

export const getGesturePriority = (gesture: string) =>
    order.indexOf(gesture) + 1
