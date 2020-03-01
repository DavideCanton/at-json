import multi from '@rollup/plugin-multi-entry';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const pkg = require('./package.json')

export default {
    input: 'tmp/*.js',
    output:
        [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            }
        ],
    plugins: [
        multi(),
        terser(),
        copy({
            targets: [
                {src: 'tmp/*.d.ts', dest: 'dist/'},
            ]
        })
    ]
};
