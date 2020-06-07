import typescript from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import replace from "@rollup/plugin-replace"
import pkg from "./package.json"

const typescriptConfig = { declaration: false }

const config = {
    input: "src/index.ts",
}

const srcmap = {
    sourcemap: true,
    sourcemapExcludeSources: true
}

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
]

const umd = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.dev.js`,
        format: "umd",
        name: "Motion",
        exports: "named",
        globals: { react: "React" },
        ...srcmap,
    },
    external: ["react", "react-dom"],
    plugins: [
        resolve(),
        typescript(typescriptConfig),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
        sourcemap: false,
    }),
    plugins: [
        resolve(),
        typescript({...typescriptConfig, sourceMap:false}),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        terser({ output:{ comments: false }}),
    ],
})

const cjs = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.cjs.js`,
        format: "cjs",
        exports: "named",
        ...srcmap,
    },
    plugins: [typescript(typescriptConfig)],
    external,
})

const es = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.es.js`,
        format: "es",
        exports: "named",
        ...srcmap,
    },
    plugins: [typescript(typescriptConfig)],
    external,
})

export default [umd, umdProd, es, cjs]
