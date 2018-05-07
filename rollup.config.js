import resolve from 'rollup-plugin-node-resolve';
import babel   from 'rollup-plugin-babel';
import uglify  from 'rollup-plugin-uglify';
import common  from 'rollup-plugin-commonjs';
import builtin from 'rollup-plugin-node-builtins';

const plugins = [
    builtin(),
    resolve({
        jsnext : true,
        main   : true,
        browser: true,
      }),
    common(),
    babel({
        presets: [ 'es2015-rollup', 'stage-0' ],
        exclude: 'node_modules/**'
    }),
    ( process.env.NODE_ENV === 'production' && uglify({
        compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true
          },
          output: {
            comments: false
          }
     })),
];

export default [
    {
        input      : './src/userscript/simpread.js',
        output     : {
            format : 'iife',
            file   :  process.env.NODE_ENV === 'production' ? './dist/simpread.user.min.js' : './dist/simpread.user.js',
        },
        plugins,
    }
]