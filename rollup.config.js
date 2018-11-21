import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

const typescriptConfig = { cacheRoot: 'tmp/.rpt2_cache' };
const noDeclarationConfig = Object.assign({}, typescriptConfig, {
  tsconfigOverride: { compilerOptions: { declaration: false } }
});

const config = {
  input: 'src/index.ts'
};

const external = [
  'react',
  '@popmotion/popcorn',
  'framesync',
  'stylefire',
  'hey-listen',
  'popmotion',
  'style-value-types'
];

const umd = Object.assign({}, config, {
  output: {
    file: `dist/${pkg.name}.dev.js`,
    format: 'umd',
    name: 'FramerMotion',
    exports: 'named',
    globals: { react: 'React' }
  },
  external: ['react', 'react-dom'],
  plugins: [
    typescript(noDeclarationConfig),
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
});

const umdProd = Object.assign({}, umd, {
  output: Object.assign({}, umd.output, {
    file: `dist/${pkg.name}.js`
  }),
  plugins: [
    typescript(noDeclarationConfig),
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    uglify()
  ]
});

const cjs = Object.assign({}, config, {
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    exports: 'named'
  },
  plugins: [typescript(typescriptConfig)],
  external
});

const es = Object.assign({}, config, {
  output: {
    file: `dist/${pkg.name}.es.js`,
    format: 'es',
    exports: 'named'
  },
  plugins: [typescript(noDeclarationConfig)],
  external
});

export default [umd, umdProd, es, cjs];
