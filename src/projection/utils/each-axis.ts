type Callback = (axis: "x" | "y") => void

export function eachAxis(callback: Callback) {
    callback("x")
    callback("y")
}
