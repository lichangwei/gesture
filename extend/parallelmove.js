/**
 * @overview Regiester parallelmove event.
 * @requires gesture.js
 */
(function(g){

'use strict';

var isAndroid = navigator.userAgent.indexOf('Android') >= 0;

g.opt('parallelmove_min_scale', 0.83);
g.opt('parallelmove_max_scale', 1.2);

g.register('parallelmove', {
  gestureend: function(e){
    var scale = e.scale;
    if(scale > g.opt('parallelmove_min_scale') && scale < g.opt('parallelmove_max_scale') ){
      g.createEvent('parallelmove', e);
    }
  },
  touchstart: function(e){
    e.preventDefault();
  },
  touchmove: function(e){
    e.preventDefault();
  },
  touchend: function(e){
    e.preventDefault();
  }
});

})(g);