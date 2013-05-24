/**
 * @overview Regiester taphold event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

g.register('taphold', {
  touchstart: function(e, data){
    var currentTarget = e.currentTarget;
    data.timerTaphold = setTimeout(function(){
      g.createEvent('taphold', e, {
        eventTarget: currentTarget
      });
    }, g.opt('tap_max_duration'));
  },
  touchmove: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(distance > g.opt('tap_max_distance')){
      clearTimeout(data.timerTaphold);
    }
  },
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    clearTimeout(data.timerTaphold);
  }
});

})(g);
