import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
    input: 'lib/index.ts',
    output: [
        {
            file: pkg.main,
            name: 'atJson',
            format: 'umd',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ],
    external: [
        ...Object.keys(pkg.dependencies || {})
    ],
    plugins: [
        typescript({
            tsconfigOverride:  {
                compilerOptions: {
                    module: 'ES2015'
                }
            }
        })
    ]
};
