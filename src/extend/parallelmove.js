/**
 * @overview Regiester parallelmove event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('parallelmove_min_scale', 0.83);
g.opt('parallelmove_max_scale', 1.2);

// Parallel move two fingers
g.register('parallelmove', {
  gestureend: function(e, data){
    var scale = e.scale;
    // here we simply compare the distance between 2 figures of the beginning and the end.
    if(scale > g.opt('parallelmove_min_scale') && scale < g.opt('parallelmove_max_scale') ){
      g.createEvent('parallelmove', e);
    }
  }
});

})(g);