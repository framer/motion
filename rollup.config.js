import commonjs from "rollup-plugin-commonjs"
import typescript from "rollup-plugin-typescript2"
import resolve from "rollup-plugin-node-resolve"
import { uglify } from "rollup-plugin-uglify"
import replace from "rollup-plugin-replace"
import pkg from "./package.json"

const typescriptConfig = {
    cacheRoot: "tmp/.rpt2_cache",
    tsconfigOverride: { compilerOptions: { declaration: false } },
}

const config = {
    input: "src/index.ts",
}

const external = [
    "react",
    "@popmotion/easing",
    "@popmotion/popcorn",
    "framesync",
    "stylefire",
    "hey-listen",
    "popmotion",
    "style-value-types",
    "@emotion/is-prop-valid",
]

const umd = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.dev.js`,
        format: "umd",
        name: "Motion",
        exports: "named",
        globals: { react: "React" },
    },
    external: ["react", "react-dom"],
    plugins: [
        resolve(),
        commonjs(),
        typescript(typescriptConfig),
        replace({
            "process.env.NODE_ENV": JSON.stringify("development"),
        }),
    ],
})

const umdProd = Object.assign({}, umd, {
    output: Object.assign({}, umd.output, {
        file: `dist/${pkg.name}.js`,
    }),
    plugins: [
        resolve(),
        commonjs(),
        typescript(typescriptConfig),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
        }),
        uglify(),
    ],
})

const cjs = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.cjs.js`,
        format: "cjs",
        exports: "named",
    },
    plugins: [commonjs(), typescript(typescriptConfig)],
    external,
})

const es = Object.assign({}, config, {
    output: {
        file: `dist/${pkg.name}.es.js`,
        format: "es",
        exports: "named",
    },
    plugins: [commonjs(), typescript(typescriptConfig)],
    external,
})

export default [umd, umdProd, es, cjs]
