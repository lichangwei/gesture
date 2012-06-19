(function(){

var events = {};
var timeout = {};

g.register('tap,doubletap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        var _gesture_id = e.currentTarget._gesture_id;
        if(events[_gesture_id] === void 0){
            events[_gesture_id] = [];
        }
        if( distance <= 30 && deltaT <= 300 ){
            events[_gesture_id].push(e);
        }
        if(events[_gesture_id].length >= 2){
            clearTimeout(timeout[_gesture_id]);
            g.createEvent('doubletap', e, {events: events[gid]});
            events[_gesture_id] = [];
        }else if(events[_gesture_id].length === 1){
            (function(gid){
                timeout[gid] = setTimeout(function(){
                    g.createEvent('tap', e, {events: events[gid]});
                    events[gid] = [];
                }, g.opt('tap_interval'));
            })(_gesture_id);
        }
    }
});

})();