/**
 * @overview Regiester doubletap event. Cannot be used with tap-doubletap.js
 * @requires gesture.js
 */
(function(g){

'use strict';

// keep previous tap's timeStamp
var timeStamp = {};

g.register('doubletap', {
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    
    if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
      return;

    var targets = data.targets;
    if(e.timeStamp - data.doubletapTimeStamp < g.opt('doubletap_max_interval')){
      targets.push(e.target);
      g.createEvent('doubletap', e, {
        eventTarget: e.currentTarget,
        targets: targets
      });
      targets.length = 0;
    }else{
      data.doubletapTimeStamp = e.timeStamp;
      targets.length = 0;
      targets[0] = e.target;
    }
  }
});

})(g);