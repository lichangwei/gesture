/**
 * @overview Regiester taphold event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

var timers = {};

g.register('taphold', {
  touchstart: function(e){
    var currentTarget = e.currentTarget;
    timers[this._gesture_id] = setTimeout(function(){
      g.createEvent('taphold', e, {
        eventTarget: currentTarget
      });
    }, g.opt('tap_max_duration'));
  },
  touchmove: function(e, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(distance > g.opt('tap_max_distance')){
      clearTimeout(timers[this._gesture_id]);
    }
  },
  touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY){
    clearTimeout(timers[this._gesture_id]);
  }
});

})(g);
