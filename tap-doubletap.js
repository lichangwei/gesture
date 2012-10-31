/**
 * Cannot be used with tap.js & doubletap.js
 */
(function(g){

'use strict';

var targets = {};
var timeout = {};

g.register('tap doubletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap-max-distance') || deltaT > g.opt('tap-max-duration'))
            return;
        handler(this, e);
    }
});

function handler(elem, e){
    var gid = elem._gesture_id;
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