/**
 * @overview Regiester tap & doubletap event. 
 *  Cannot be used with tap.js or doubletap.js. <br/>
 *  After a tap event occured, it won't be fired. if another tap occured in 250ms, 
 *  then a doubletap event fired, otherwise a tap event fired.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('tap doubletap', {
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
      return;
    handler(this, e, data);
  }
});

function handler(elem, e, data){
  var targets = data.targets;
  targets.push(e.target);

  if(targets.length >= 2){
    clearTimeout(data.timerTapDoubletap);
    g.createEvent('doubletap', e, {
      targets: data.targets
    });
    targets.length = 0;
  }else if(targets.length === 1){
    (function(e, data){
      var currentTarget = e.currentTarget;
      data.timerTapDoubletap = setTimeout(function(){
        g.createEvent('tap', e, {
          eventTarget: currentTarget,
          targets: data.targets
        });
        data.targets.length = 0;
      }, g.opt('doubletap_max_interval'));
    })(e, data);
  }
}

})(g);