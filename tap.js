(function(){

'use strict';

var targets = {};
var timeout = {};
var attr_name = '_g_tap';
var events = ['tap', 'doubletap', 'tripletap'];
var tap_max_distance = 'tap-max-distance';
var tap_taphold_press_duration = 'tap-taphold-press-duration';
var tap_multi_interval = 'tap-multi-interval';

g.register(events.join(' '), {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt(tap_max_distance) || deltaT > g.opt(tap_taphold_press_duration))
            return;
        var tap_type = this[attr_name];
        tap_type && handler[tap_type].call(this, e);
    }
}, function(event){
    var tap_type = this[attr_name];
    if(!tap_type || (events.indexOf(tap_type) < events.indexOf(event))){
        this[attr_name] = event;
    }
});

var handler = {};

handler.tap = function(e){
    g.createEvent(events[0], e);
};

handler.doubletap = function(e){
    var gid = this._gesture_id;
    var ts = targets[gid] || (targets[gid] = []);
    ts.push(e.target);
    if(ts.length >= 2){
        clearTimeout(timeout[gid]);
        g.createEvent(events[1], e, {
            targets: targets[gid]
        });
        targets[gid] = null;
    }else if(ts.length === 1){
        (function(e, gid){
            var currentTarget = e.currentTarget;
            timeout[gid] = setTimeout(function(){
                g.createEvent(events[0], e, {
                    eventTarget: currentTarget,
                    targets: targets[gid]
                });
                targets[gid] = null;
            }, g.opt(tap_multi_interval));
        })(e, gid);
    }
};

handler.tripletap = function(e){
    var gid = this._gesture_id;
    var ts = targets[gid] || (targets[gid] = []);
    ts.push(e.target);
    if( ts.length >= 3 ){
        g.createEvent(events[2], e, {targets: ts});
        clearTimeout(timeout[gid]);
        targets[gid] = null;
    }else if(ts.length === 2){
        (function(e, gid){
            var currentTarget = e.currentTarget;
            clearTimeout(timeout[gid]);
            timeout[gid] = setTimeout(function(){
                g.createEvent(events[1], e, {
                    eventTarget: currentTarget,
                    targets: ts
                });
                targets[gid] = null;
            }, g.opt(tap_multi_interval));
        })(e, gid);
    }else if(ts.length === 1){
        (function(e, gid){
            var currentTarget = e.currentTarget;
            timeout[gid] = setTimeout(function(){
                g.createEvent(events[0], e, {
                    eventTarget: currentTarget,
                    targets: ts
                });
                targets[gid] = null;
            }, g.opt(tap_multi_interval));
        })(e, gid);
    }
};

})();