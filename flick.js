/**
 * @overview Regiester flick event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('flick', {
  touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    var direction;
    var threshold = g.opt('flick_min_x_or_y');
    if( Math.abs(deltaX) >= Math.abs(deltaY) ){
      if( deltaX > threshold ){
        direction = 'right';
      }else if( deltaX < -threshold ){
        direction = 'left';
      }
    }else{
      if( deltaY > threshold ){
        direction = 'down';
      }else if( deltaY < -threshold ){
        direction = 'up';
      }
    }
    if( !direction ) return;
    g.createEvent('flick', e, {
      direction: direction
    });
  }
});

})(g);