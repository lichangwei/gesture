/**
 * @overview Regiester taphold event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

g.register('taphold', {
  touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(distance > g.opt('tap_max_distance') || deltaT <= g.opt('tap_max_duration'))
      return;
    g.createEvent('taphold', e);
  }
});

})(g);
