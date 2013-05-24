/**
 * @overview Regiester rotatestart rotate rotateend event.
 * @requires gesture.js
 * @desc g.opt('rotate_min_step', 1); to trigger a rotate event only if
 */
(function(g){

'use strict';

g.opt('rotate_min_step', 1);

var rotateMinStep;

g.register('rotatestart rotate rotateend', {
  gesturestart: function(e, data){
    data.rotation = e.rotation;
    g.createEvent('rotatestart', e);
    rotateMinStep = g.opt('rotate_min_step');
  },
  gesturechange: function(e, data){
    var before  = data.rotation;
    var current = e.rotation;
    current = adjust(current, before);
    if(Math.abs(current - before) < rotateMinStep){
      return;
    }
    data.rotation = current;
    g.createEvent('rotate', e, {
      rotation: data.rotation
    });
  },
  gestureend: function(e, data){
    g.createEvent('rotateend', e, {
      rotation: data.rotation
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