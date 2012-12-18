/**
 * @overview Regiester zoom event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('zoom zoomStart', {
  touchstart: g.util.preventDefault,
  touchmove : g.util.preventDefault,
  touchend  : g.util.preventDefault,
  gesturestart: function(e){
    g.createEvent('zoomStart', e);
  },
  gesturechange: function(e){
    g.createEvent('zoom', e, {
      scale: e.scale
    });
  }
});

})(g);