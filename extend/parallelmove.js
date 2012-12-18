/**
 * @overview Regiester parallelmove event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('parallelmove_min_scale', 0.83);
g.opt('parallelmove_max_scale', 1.2);

g.register('parallelmove', {
  touchstart: g.util.preventDefault,
  touchmove : g.util.preventDefault,
  touchend  : g.util.preventDefault,
  gestureend: function(e){
    var scale = e.scale;
    if(scale > g.opt('parallelmove_min_scale') && scale < g.opt('parallelmove_max_scale') ){
      g.createEvent('parallelmove', e);
    }
  }
});

})(g);