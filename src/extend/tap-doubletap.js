/**
 * @overview Regiester tap & doubletap event. 
 *
 *  Cannot be used with tap.js, doubletap.js or tap-doubletap.js. <br/>
 *
 *  The difference between me and tap-doubletap.js is:
 *  If a element bind a doubletap event, after a tap event occured, it won't be fired. if another tap occured in 250ms, 
 *  then a doubletap event fired, otherwise a tap event fired.
 *  If a element only bind tap events, after a tap event occured, fire a tap event immediately.
 *
 *  Note: Please pay a attention to use event delegation.
 *
 * @requires gesture.js
 *
 */
(function(g){

'use strict';

var targets = {};
var timeout = {};
var attr_name = '_g_tap';

g.register('tap doubletap', {
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
      return;
    var tap_type = this[attr_name] || 'doubletap';
    handler[tap_type].call(this, e, data);
  }
}, function(event){
  if(event === 'doubletap'){
    this[attr_name] = 'doubletap';
  }
});

var handler = {};
/*
 * If a element only bind tap events, fire immediately.
 */
handler.tap = function(e){
  g.createEvent('tap', e);
};

/*
 * If a element bind at least one doubletap event, waiting for doubletap_max_interval(default 250) ms.
 */
handler.doubletap = function(e, data){
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
};

})(g);