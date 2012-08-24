(function(){

'use strict';

var targets = {};
var timeout = {};
var attr_name = '_g_tap';
var events = ['tap', 'doubletap', 'tripletap'];

g.register(events.join(' '), {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap-max-distance') || deltaT > g.opt('tap-max-delta-time'))
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
    g.createEvent('tap', e);
};

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
            }, g.opt('tap-interval'));
        })(e, gid);
    }
};

handler.tripletap = function(e){
    var gid = this._gesture_id;
    var ts = targets[gid] || (targets[gid] = []);
    ts.push(e.target);
    if( ts.length >= 3 ){
        g.createEvent('tripletap', e, {targets: ts});
        clearTimeout(timeout[gid]);
        targets[gid] = null;
    }else if(ts.length === 2){
        (function(e, gid){
            var currentTarget = e.currentTarget;
            clearTimeout(timeout[gid]);
            timeout[gid] = setTimeout(function(){
                g.createEvent('doubletap', e, {
                    eventTarget: currentTarget,
                    targets: ts
                });
                targets[gid] = null;
            }, g.opt('tap-interval'));
        })(e, gid);
    }else if(ts.length === 1){
        (function(e, gid){
            var currentTarget = e.currentTarget;
            timeout[gid] = setTimeout(function(){
                g.createEvent('tap', e, {
                    eventTarget: currentTarget,
                    targets: ts
                });
                targets[gid] = null;
            }, g.opt('tap-interval'));
        })(e, gid);
    }
};

})();