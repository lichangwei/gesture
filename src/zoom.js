/**
 * @overview Regiester zoom event.
 * @requires gesture.js
 * @desc g.opt('zoom_min_step', 1.1); trigger a zoom event only if
 */
(function(g){

'use strict';

var max, min;
g.opt('zoom_min_step', 1.1);

g.register('zoomstart zoom zoomend', {
  gesturestart: function(e, data){
    g.createEvent('zoomstart', e);
    data.scale = 1;
    var step = g.opt('zoom_min_step');
    min = 1 / step;
    max = step;
  },
  gesturechange: function(e, data){
    var ratio = e.scale / data.scale;
    if(ratio > min && ratio < max){
      return;
    }
    data.scale = e.scale;
    g.createEvent('zoom', e, {
      scale: e.scale
    });
  },
  gestureend: function(e, data){
    g.createEvent('zoomend', e, {
      scale: data.scale
    });
  }
});

})(g);