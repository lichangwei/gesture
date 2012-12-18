/**
 * @overview Regiester rotate event.
 * @requires gesture.js
 */
(function(g){

'use strict';

var rotations = {};

g.register('rotate rotateStart', {
  touchstart: g.util.preventDefault,
  touchmove : g.util.preventDefault,
  touchend  : g.util.preventDefault,
  gesturestart: function(e){
    var gid = this._gesture_id;
    rotations[gid] = e.rotation;
    g.createEvent('rotateStart', e);
  },
  gesturechange: function(e){
    var gid = this._gesture_id;
    var before  = rotations[gid];
    var current = e.rotation;
    rotations[gid] = current = adjust(current, before);
    g.createEvent('rotate', e, {
      rotation: current
    });
  }
});

function adjust(current, before){
  if(current - before > 90){
    current = current - 180;
  }else if(current - before < -90){
    current = current + 180;
  }
  return current;
}

})(g);