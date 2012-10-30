(function(g){

'use strict';

// keep previous tap's timeStamp
var timeStamp = {};
// keep previous tap's target element
var target = {};

g.register('doubletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        
        if(distance > g.opt('tap-max-distance') || deltaT > g.opt('tap-max-duration'))
            return;
        
        var gid = this._gesture_id;
        var prev = timeStamp[gid];

        if( e.timeStamp - prev < g.opt('doubletap_max_interval') ){
            g.createEvent('doubletap', e, {
                eventTarget: e.currentTarget,
                targets: [target[gid], e.target]
            });
            timeStamp[gid] = void 0;
            target[gid] = void 0;
        }else{
            target[gid] = e.target;
            timeStamp[gid] = e.timeStamp;
        }
    }
});

})(g);