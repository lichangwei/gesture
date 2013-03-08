/**
 * @desc minimize gesture
 * @step: (1) run 'npm install webtools'
 *        (2) comment the file you don't need and update initScript if needed.
 *        (3) run 'node minimize.js'
 *        (4) introduce gesture-min.js to your site.
 */
require('webtools')
  .uglifyjs({
    'input': [
      '../src/gesture.js',
      // '../src/tap.js',
      // '../src/doubletap.js',
      '../src/tap-doubletap.js',
      // '../src/taphold.js ',
      // '../src/flick.js ',
      // '../src/zoom.js ',
      // '../src/dragdrop.js ',
      // '../src/drag.js ',

      // '../plugin/touch-alink.js',
    ],
    'licence': '@license The MIT License, @author Li Chang Wei <lichangwei@love.com>, @see https://github.com/lichangwei/gesture',
    'initScript': 'g.opt(\'tap_max_duration\', 300);',
    'output': 'gesture-min.js'
  });


