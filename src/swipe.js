/**
 * @overview Regiester swipestart swipe swipeend event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('swipestart swipe swipeend', {
  touchstart: function(e, data, x, y){
    e.preventDefault();
  },
  touchmove: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(!data.isSwipe && distance >= g.opt('tap_max_distance')){
      data.isSwipe = true;
      g.createEvent('swipestart', e);
    }
    if(data.isSwipe){
      g.createEvent('swipe', e, {
        deltaX: deltaX,
        deltaY: deltaY
      });
    }
  },
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(!data.isSwipe) return;
    var speedX = deltaX / deltaT * 1000;
    var speedY = deltaY / deltaT * 1000;
    g.createEvent('swipeend', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      speedX: speedX,
      speedY: speedY
    });
    data.isSwipe = false;
  }
});

})(g);