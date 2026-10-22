/**
 * @jest-environment node
 */
import { buildSync } from "esbuild"
import * as path from "path"

const packages = path.resolve(__dirname, "../../../../..")

function bundle(contents: string) {
    return buildSync({
        stdin: { contents, resolveDir: __dirname, loader: "ts" },
        bundle: true,
        write: false,
        format: "esm",
        external: ["react", "react-dom", "react/jsx-runtime"],
        alias: {
            "motion-dom": path.join(packages, "motion-dom/src/index.ts"),
            "motion-utils": path.join(packages, "motion-utils/src/index.ts"),
        },
        define: { "process.env.NODE_ENV": '"production"' },
    }).outputFiles[0].text
}

/**
 * Strings only found in features: the layout scale correctors, the drag
 * controls and the inView gesture.
 */
const domMaxCanaries = ["boxShadow", "dragMomentum", "IntersectionObserver"]

const findCanaries = (code: string) =>
    domMaxCanaries.filter((canary) => code.includes(canary))

/**
 * #2232: an app that defers features with LazyMotion shouldn't bundle them
 * by rendering Reorder.
 */
describe("Reorder tree-shaking", () => {
    test("Reorder from the m entry doesn't include domMax", () => {
        const code = bundle(
            `export { Reorder } from "../../../m"
            export { LazyMotion } from "../../LazyMotion"`
        )

        expect(code.includes("overflowAnchor")).toBe(true)
        expect(findCanaries(code)).toEqual([])
    })

    test("Reorder from the main entry includes domMax", () => {
        const code = bundle(`export { Reorder } from "../../../index"`)

        expect(findCanaries(code)).toEqual(domMaxCanaries)
    })
})
