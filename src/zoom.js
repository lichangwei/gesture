/**
 * @overview Regiester zoom event.
 * @requires gesture.js
 * @desc g.opt('zoom_min_step', 1.1); trigger a zoom event only if
 */
(function(g){

'use strict';

var scales = {};
var max, min;
g.opt('zoom_min_step', 1.1);

g.register('zoomstart zoom zoomend', {
  gesturestart: function(e){
    g.createEvent('zoomstart', e);
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
  },
  gestureend: function(e){
    var gid = this._gesture_id;
    g.createEvent('zoomend', e, {
      scale: scales[gid]
    });
  }
});

})(g);