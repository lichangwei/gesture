(function(){

var targets = {};
var timeout = {};

g.register('tap,doubletap,tripletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if( distance > 30 || deltaT > 300 ) return;
        var gid = this._gesture_id;
        var ts = targets[gid] || (targets[gid] = []);
        ts.push(e.target);
        if( ts.length >= 3 ){
            g.createEvent('tripletap', e, {targets: ts});
            clearTimeout(timeout[gid]);
            targets[gid] = null;
        }else if(ts.length === 2){
            (function(e, gid){
                clearTimeout(timeout[gid]);
                timeout[gid] = setTimeout(function(){
                    g.createEvent('doubletap', e, {targets: ts});
                    targets[gid] = null;
                }, g.opt('tap_interval'));
            })(e, gid);
        }else if(ts.length === 1){
            (function(e, gid){
                timeout[gid] = setTimeout(function(){
                    g.createEvent('tap', e, {targets: ts});
                    targets[gid] = null;
                }, g.opt('tap_interval'));
            })(e, gid);
        }
    }
});

})();