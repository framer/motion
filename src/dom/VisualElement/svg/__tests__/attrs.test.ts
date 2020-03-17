import { createBuildSVGAttrs } from "../attrs"

const dimensions = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
}

test("should correctly create SVG attrs with correct casing", () => {
    const build = createBuildSVGAttrs()
    const { style, ...attrs } = build(
        {
            attrX: 1,
            attrY: 2,
            cx: 0,
            x: 3,
            y: 4,
            scale: 2,
            rotate: 90,
            originX: 1,
            originY: 2,
            limitingConeAngle: 100,
            alignmentBaseline: "bottom",
        },
        {},
        dimensions
    )

    expect(style).toEqual({
        transform: "translateX(3px) translateY(4px) scale(2) rotate(90deg)",
        transformOrigin: "150px 200px",
    })

    expect(attrs).toEqual({
        cx: 0,
        x: 1,
        y: 2,
        limitingConeAngle: 100,
        "alignment-baseline": "bottom",
    })
})

test("should add origin when transform detected", () => {
    const build = createBuildSVGAttrs()
    const { style } = build({ rotate: 90 }, {}, dimensions)
    expect(style).toEqual({
        transform: "rotate(90deg)",
        transformOrigin: "125px 125px",
    })
})

test("should add origin when specified", () => {
    const build = createBuildSVGAttrs()
    const { style } = build({ originX: 0 }, {}, dimensions)
    expect(style).toEqual({
        transformOrigin: "100px 125px",
    })
})

test("should handle special path props", () => {
    const buildPath = createBuildSVGAttrs()
    const pathAttrs = buildPath(
        {
            pathLength: 0.25,
            pathSpacing: 0.5,
            pathOffset: 0.75,
        },
        {},
        dimensions,
        400
    )

    expect(pathAttrs).toEqual({
        "stroke-dasharray": "100px 200px",
        "stroke-dashoffset": "-300px",
        style: {},
    })

    const buildProps = createBuildSVGAttrs()

    const props = buildProps(
        {
            strokeWidth: 1,
            alignmentBaseline: "bottom",
            pathLength: 0.25,
            pathSpacing: 0.5,
            pathOffset: 0.75,
        },
        {},
        dimensions,
        400,
        false
    )

    expect(props).toEqual({
        strokeWidth: 1,
        alignmentBaseline: "bottom",
        strokeDasharray: "100px 200px",
        strokeDashoffset: "-300px",
        style: {},
    })
})
