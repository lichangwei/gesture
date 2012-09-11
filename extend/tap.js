(function(g){

'use strict';

var targets = {};
var timeout = {};
var attr_name = '_g_tap';

g.register('tap doubletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap-max-distance') || deltaT > g.opt('tap-taphold-press-duration'))
            return;
        var tap_type = this[attr_name] || 'tap';
        handler[tap_type].call(this, e);
    }
}, function(event){
	if( event === 'doubletap' ){
		this[attr_name] = 'doubletap';
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
            }, g.opt('doubletap_max_interval'));
        })(e, gid);
    }
};

})(g);