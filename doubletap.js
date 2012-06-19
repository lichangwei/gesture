(function(){

var times = {};
var timeout = {};

g.register('tap,doubletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        var _gesture_id = e.currentTarget._gesture_id;
        if(times[_gesture_id] === void 0){
            times[_gesture_id] = 0;
        }
        if( distance <= 30 && deltaT <= 300 ){
            times[_gesture_id]++;
        }
        if( times[_gesture_id] >= 2 ){
            times[_gesture_id] = 0;
            clearTimeout(timeout[_gesture_id]);
            g.createEvent('doubletap', e);
        }else if(times[_gesture_id] === 1){
            (function(e, gid){
                var attrs = {
                    currentTarget: e.currentTarget
                };
                timeout[gid] = setTimeout(function(){
                    times[gid] = 0;
                    g.createEvent('tap', e, attrs);
                }, g.opt('tap_interval'));
            })(e, _gesture_id);
        }
    }
});

})();