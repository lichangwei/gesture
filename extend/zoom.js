/**
 * @overview Regiester zoom event.
 * @requires gesture.js
 */
(function(g){

'use strict';

var scales = {};
var max, min;
g.opt('zoom_min_step', 1.1);

g.register('zoom zoomStart', {
  touchstart: g.util.preventDefault,
  touchmove : g.util.preventDefault,
  touchend  : g.util.preventDefault,
  gesturestart: function(e){
    g.createEvent('zoomStart', e);
    scales[this._gesture_id] = 1;
    var step = g.opt('zoom_min_step');
    min = 1 / step;
    max = step;
  },
  gesturechange: function(e){
    var gid = this._gesture_id;
    var scale = e.scale;
    var ratio = scales[gid] / scale;
    if(ratio > min && ratio < max){
      return;
    }
    scales[gid] = scale;
    g.createEvent('zoom', e, {
      scale: scale
    });
  }
});

})(g);