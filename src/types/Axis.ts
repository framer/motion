class Axis {
    min: number
    max: number

    constructor(min: number, max: number) {
        this.min = min
        this.max = max
    }

    get length() {
        return this.max - this.min
    }
}

class AxisBox {
    x: Axis
    y: Axis

    constructor(x: Axis, y: Axis) {
        this.x = x
        this.y = y
    }
}

new Axis(0, 0)
