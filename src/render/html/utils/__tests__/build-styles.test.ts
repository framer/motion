import "../../../../../jest.setup"
import { buildHTMLStyles } from "../build-styles"
import { DOMVisualElementOptions } from "../../../dom/types"
import { BoxDelta, Point2D, AxisBox2D } from "../../../../types/geometry"
import { ResolvedValues } from "../../../types"
import { TransformOrigin } from "../../types"

describe("buildHTMLStyles", () => {
    test("Builds basic styles", () => {
        const latest = { width: 100 }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({ width: "100px" })
    })

    test("Builds vars", () => {
        const latest = { "--width": 100 }
        const vars = {}
        build(latest, { vars })

        expect(vars).toEqual({ "--width": 100 })
    })

    test("Builds transform with default value types", () => {
        const latest = { x: 1, y: 2, rotateX: 90, transformPerspective: 200 }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({
            transform:
                "perspective(200px) translateX(1px) translateY(2px) rotateX(90deg) translateZ(0)",
        })
    })

    test("Builds perspective into the CSS perspective style", () => {
        const latest = { perspective: 100, transform: "translateX(100px)" }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({
            perspective: "100px",
            transform: "translateX(100px)",
        })
    })

    test("Builds transform with defined value types", () => {
        const latest = { x: "1vw", y: "2%", rotateX: "90turn" }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({
            transform:
                "translateX(1vw) translateY(2%) rotateX(90turn) translateZ(0)",
        })
    })

    test("Builds transform without translateZ if enableHardwareAcceleration is false", () => {
        const latest = { x: 1, y: 2, rotateX: 90 }
        const style = {}
        build(latest, { style, config: { enableHardwareAcceleration: false } })

        expect(style).toEqual({
            transform: "translateX(1px) translateY(2px) rotateX(90deg)",
        })
    })

    test("Builds transform none if all transforms are default", () => {
        const latest = { x: 0, y: 0, scale: 1 }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({
            transform: "none",
        })
    })

    test("Doesn't build transform none if all transforms are default if allowTransformNone is false", () => {
        const latest = { x: 0, y: 0, scale: 1 }
        const style = {}
        build(latest, { style, config: { allowTransformNone: false } })

        expect(style).toEqual({
            transform: "translateX(0px) translateY(0px) scale(1) translateZ(0)",
        })
    })

    test("Builds transformOrigin with correct default value types", () => {
        const latest = { originX: 0.2, originY: "60%", originZ: 10 }
        const style = {}
        build(latest, { style })

        expect(style).toEqual({
            transformOrigin: "20% 60% 10px",
        })
    })

    test("Applies transformTemplate if provided", () => {
        const latest = { x: 1 }
        const style = {}
        build(latest, {
            style,
            config: {
                transformTemplate: ({ x }: any, gen: any) =>
                    `translateY(${parseFloat(x as string) * 2}) ${gen}`,
            },
        })

        expect(style).toEqual({
            transform: "translateY(2) translateX(1px) translateZ(0)",
        })
    })

    test("Applies transformTemplate if provided", () => {
        const latest = { x: 1 }
        const style = {}
        build(latest, {
            style,
            config: {
                transformTemplate: ({ x }: any, gen: any) =>
                    `translateY(${parseFloat(x as string) * 2}) ${gen}`,
            },
        })

        expect(style).toEqual({
            transform: "translateY(2) translateX(1px) translateZ(0)",
        })
    })

    test("Uses layout projection transform if enabled", () => {
        const latest = {}
        const style = {}
        const delta = {
            x: { translate: 1, scale: 0.5, origin: 0.8, originPoint: 0 },
            y: { translate: 2, scale: 2, origin: 0.2, originPoint: 0 },
        }

        build(latest, {
            style,
            isLayoutProjectionEnabled: true,
            treeScale: { x: 1, y: 1 },
            delta,
            deltaFinal: delta,
            targetBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        expect(style).toEqual({
            transform: "translate3d(1px, 2px, 0) scale(0.5, 2)",
            transformOrigin: "80% 20% 0",
        })
    })

    test("Adds rotate transforms if present, but not translation, scale and skew", () => {
        /**
         * Translation and rotate are already baked into deltaFinal
         */

        const latest = { x: 100, rotate: 90, skew: 3 }
        const style = {}
        const delta = {
            x: { translate: 1, scale: 0.5, origin: 0.8, originPoint: 0 },
            y: { translate: 2, scale: 2, origin: 0.2, originPoint: 0 },
        }

        build(latest, {
            style,
            isLayoutProjectionEnabled: true,
            treeScale: { x: 1, y: 1 },
            delta,
            deltaFinal: delta,
            targetBox: {
                x: { min: 0, max: 100 },
                y: { min: 0, max: 100 },
            },
        })

        expect(style).toEqual({
            transform: "translate3d(1px, 2px, 0) rotate(90deg) scale(0.5, 2)",
            transformOrigin: "80% 20% 0",
        })
    })

    test("Applies scale correction to borderRadius and boxShadow", () => {
        /**
         * Translation and rotate are already baked into deltaFinal
         */

        const latest = {
            borderRadius: 1,
            boxShadow: "10px 20px 30px rgba(0, 0, 0, 0.5)",
        }
        const style = {}
        const delta = {
            x: { translate: 1, scale: 0.5, origin: 0.8, originPoint: 0 },
            y: { translate: 2, scale: 2, origin: 0.2, originPoint: 0 },
        }

        build(latest, {
            style,
            isLayoutProjectionEnabled: true,
            treeScale: { x: 0.5, y: 2 },
            delta,
            deltaFinal: delta,
            targetBox: {
                x: { min: 0, max: 10 },
                y: { min: 0, max: 20 },
            },
        })

        expect(style).toEqual({
            transform: "translate3d(2px, 1px, 0) scale(0.5, 2)",
            transformOrigin: "80% 20% 0",
            borderBottomLeftRadius: "10% 5%",
            borderBottomRightRadius: "10% 5%",
            borderTopLeftRadius: "10% 5%",
            borderTopRightRadius: "10% 5%",
            boxShadow: "40px 5px 14.11765px rgba(0, 0, 0, 0.5)",
        })
    })
})

interface BuildProps {
    style: ResolvedValues
    vars: ResolvedValues
    transform: ResolvedValues
    transformOrigin: TransformOrigin
    transformKeys: string[]
    config: DOMVisualElementOptions & { transformTemplate?: any }
    isLayoutProjectionEnabled: boolean
    delta?: BoxDelta
    deltaFinal?: BoxDelta
    treeScale?: Point2D
    targetBox?: AxisBox2D
}

function build(
    latest: ResolvedValues,
    {
        style = {},
        vars = {},
        transform = {},
        transformOrigin = {},
        transformKeys = [],
        config = {
            enableHardwareAcceleration: true,
            allowTransformNone: true,
        },
        isLayoutProjectionEnabled,
        delta,
        deltaFinal,
        treeScale,
        targetBox,
    }: Partial<BuildProps> = {}
) {
    buildHTMLStyles(
        {
            style,
            vars,
            transform,
            transformOrigin,
            transformKeys,
        },
        latest,
        {
            target: targetBox,
            isEnabled: isLayoutProjectionEnabled,
            isTargetLocked: false,
            targetFinal: targetBox,
        } as any,
        {
            delta,
            deltaFinal,
            treeScale,
            isHydrated: true,
        } as any,
        config,
        config.transformTemplate
    )
}
