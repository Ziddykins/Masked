const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

const sharedConfig = {
  bundle: true,
  sourcemap: true,
  target: ['chrome91', 'firefox91'],
  format: 'iife',
};

const builds = [
  {
    ...sharedConfig,
    entryPoints: ['Masked/background.js'],
    outfile: 'Masked/dist/background.js',
  },
  {
    ...sharedConfig,
    entryPoints: ['Masked/masked.js'],
    outfile: 'Masked/dist/masked.js',
  },
  {
    ...sharedConfig,
    entryPoints: ['Masked/popup/js/popup.js'],
    outfile: 'Masked/dist/popup.js',
  },
];

if (isWatch) {
  Promise.all(builds.map(config => 
    esbuild.context(config).then(ctx => ctx.watch())
  )).then(() => popup_log('Watching for changes...'), 'info');
} else {
  Promise.all(builds.map(esbuild.build))
    .then(() => console.log('Build complete'))
    .catch(() => process.exit(1));
}