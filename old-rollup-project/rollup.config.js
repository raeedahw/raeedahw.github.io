import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'es',
    name: 'app',
    dir: 'public/build'
  },
  plugins: [
    svelte({
      compilerOptions: {
        // classic (legacy) behavior; runes are opt-in per component
        dev: !production
      },

      preprocess: sveltePreprocess({
        scss: {
			prependData: ''
        },
		postcss:false
      }),

      // Extract component CSS into a single file
      css: css => {
        css.write('public/build/bundle.css');
      }
    }),

    resolve({
      browser: true,
      dedupe: ['svelte']
    }),

    commonjs(),

    !production && serve(),

    !production && livereload('public'),

    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}
