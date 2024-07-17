export class AxisDelta {
    translate = 0
    scale = 1
    origin = 0
    originPoint = 0
}

export class Delta {
    x = new AxisDelta()
    y = new AxisDelta()
}

export class Axis {
    min = 0
    max = 0
}

export class Box {
    x = new Axis()
    y = new Axis()
}
