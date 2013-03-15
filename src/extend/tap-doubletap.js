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
  touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
      return;
    var tap_type = this[attr_name] || 'doubletap';
    handler[tap_type].call(this, e);
  }
}, function(event){
  if( event === 'doubletap' ){
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
handler.doubletap = function(e){
  var gid = this._gesture_id;
  var ts = targets[gid] || (targets[gid] = []);
  ts.push(e.target);
  if(ts.length >= 2){
    clearTimeout(timeout[gid]);
    g.createEvent('doubletap', e, {
      targets: targets[gid]
    });
    targets[gid] = null;
  }else if(ts.length === 1){
    (function(e, gid){
      var currentTarget = e.currentTarget;
      timeout[gid] = setTimeout(function(){
        g.createEvent('tap', e, {
          eventTarget: currentTarget,
          targets: targets[gid]
        });
        targets[gid] = null;
      }, g.opt('doubletap_max_interval'));
    })(e, gid);
  }
};

})(g);