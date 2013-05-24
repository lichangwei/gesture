/**
 * @overview Regiester swipestart swipe swipeend event.
 * @requires gesture.js
 */
(function(g){

'use strict';

var tap_max_distance;
var isSwipe = false;

g.register('swipestart swipe swipeend', {
  touchstart: function(e, x, y){
    e.preventDefault();
    tap_max_distance = g.opt('tap_max_distance');
  },
  touchmove: function(e, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(!isSwipe && distance >= tap_max_distance){
      isSwipe = true;
      g.createEvent('swipestart', e);
    }
    if(isSwipe){
      g.createEvent('swipe', e, {
        deltaX: deltaX,
        deltaY: deltaY
      });
    }
  },
  touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(!isSwipe) return;
    var speedX = deltaX / deltaT * 1000;
    var speedY = deltaY / deltaT * 1000;
    g.createEvent('swipeend', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      speedX: speedX,
      speedY: speedY
    });
    isSwipe = false;
  }
});

})(g);