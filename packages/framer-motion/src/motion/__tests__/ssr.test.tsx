import * as React from "react"
import { renderToString, renderToStaticMarkup } from "react-dom/server"
import { motion, useMotionValue } from "../../"
import { motionValue } from "../../value"
import { AnimatePresence } from "../../components/AnimatePresence"
import { Reorder } from "../../components/Reorder"

function runTests(render: (components: any) => string) {
    test("doesn't throw", () => {
        render(
            <motion.div
                initial={{ x: 100 }}
                whileTap={{ opacity: 0 }}
                drag
                layout
                layoutId="a"
                style={{ opacity: 1 }}
            />
        )

        expect(true).toBe(true)
    })

    test("correctly renders HTML", () => {
        const y = motionValue(200)
        const div = render(
            <AnimatePresence>
                <motion.div
                    initial={{ x: 100 }}
                    animate={{ x: 50 }}
                    style={{ y }}
                    exit={{ x: 0 }}
                />
            </AnimatePresence>
        )

        expect(div).toBe(
            '<div style="transform:translateX(100px) translateY(200px) translateZ(0)"></div>'
        )
    })

    test("correctly renders custom HTML tag", () => {
        const y = motionValue(200)
        const CustomComponent = motion("element-test")
        const customElement = render(
            <AnimatePresence>
                <CustomComponent
                    initial={{ x: 100 }}
                    animate={{ x: 50 }}
                    style={{ y }}
                    exit={{ x: 0 }}
                />
            </AnimatePresence>
        )

        expect(customElement).toBe(
            '<element-test style="transform:translateX(100px) translateY(200px) translateZ(0)"></element-test>'
        )
    })

    test("correctly renders SVG", () => {
        const cx = motionValue(100)
        const pathLength = motionValue(0.5)
        const circle = render(
            <motion.circle
                cx={cx}
                initial={{ strokeWidth: 10 }}
                style={{
                    background: "#fff",
                    pathLength,
                    x: 100,
                }}
            />
        )

        expect(circle).toBe(
            '<circle cx="100" style="background:#fff" stroke-width="10" pathLength="1" stroke-dashoffset="0px" stroke-dasharray="0.5px 1px"></circle>'
        )
        const rect = render(
            <AnimatePresence>
                <motion.rect
                    initial={{ x: 0 }}
                    animate={{ x: 100 }}
                    exit={{ x: 0 }}
                    mask=""
                    style={{
                        background: "#fff",
                    }}
                    className="test"
                    onMouseMove={() => {}}
                />
            </AnimatePresence>
        )

        expect(rect).toBe(
            '<rect mask="" style="background:#fff" class="test"></rect>'
        )
    })

    test("initial correctly overrides style", () => {
        const div = render(
            <motion.div initial={{ x: 100 }} style={{ x: 200 }} />
        )

        expect(div).toBe(
            `<div style="transform:translateX(100px) translateZ(0)"></div>`
        )
    })

    test("initial correctly overrides style with keyframes and initial={false}", () => {
        const div = render(
            <motion.div
                initial={false}
                animate={{ x: [0, 100] }}
                style={{ x: 200 }}
            />
        )

        expect(div).toBe(
            `<div style="transform:translateX(100px) translateZ(0)"></div>`
        )
    })

    test("Reorder: Renders correct element", () => {
        function Component() {
            const [state, setState] = React.useState([0])
            return (
                <Reorder.Group onReorder={setState} values={state}>
                    <Reorder.Item value="a" />
                </Reorder.Group>
            )
        }
        const div = render(<Component />)

        expect(div).toBe(
            `<ul><li style="z-index:unset;transform:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:pan-x" draggable="false"></li></ul>`
        )
    })

    test("Reorder: Doesn't render touch-scroll disabling styles if dragListener === false", () => {
        function Component() {
            const [state, setState] = React.useState([0])
            return (
                <Reorder.Group onReorder={setState} values={state}>
                    <Reorder.Item value="a" dragListener={false} />
                </Reorder.Group>
            )
        }
        const div = render(<Component />)

        expect(div).toBe(
            `<ul><li style="z-index:unset;transform:none"></li></ul>`
        )
    })

    test("Reorder: Renders provided element", () => {
        function Component() {
            const [state, setState] = React.useState([0])
            return (
                <Reorder.Group as="div" onReorder={setState} values={state}>
                    <Reorder.Item as="div" value="a" />
                </Reorder.Group>
            )
        }
        const div = render(<Component />)

        expect(div).toBe(
            `<div><div style="z-index:unset;transform:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:pan-x" draggable="false"></div></div>`
        )
    })

    test("renders motion value child", () => {
        function Component() {
            const value = useMotionValue(5)

            return <motion.div>{value}</motion.div>
        }

        const string = render(<Component />)

        expect(string).toBe("<div>5</div>")
    })
}

describe("render", () => {
    runTests(renderToString)
})

describe("renderToStaticMarkup", () => {
    runTests(renderToStaticMarkup)
})
