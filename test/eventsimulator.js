(function(){

var es = window.eventsimulator = {};
var simulator = {
    mouse: {
        events: ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'],
        create: fireMouseEvent,
    },
    touch: {
        events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
        create: fireMouseEvent
    }
};

for(var t in simulator){
    var types = simulator[t];
    for(var i = 0; i < types.events.length; i++){
        var e = types.events[i];
        es[e] = (function(create, e){
            return function(target, opt){
                create.call(window, e, target, opt);
            }
        })(types.create, e)
    }
}

function fireMouseEvent(event, target, opt){
    opt = opt || {};
    // https://developer.mozilla.org/en/DOM/event.initMouseEvent
    // https://developer.mozilla.org/en/DOM/event.detail
    // https://developer.mozilla.org/en/DOM/event.relatedTarget
    var evt = document.createEvent('MouseEvents');
    // type, canBubble, cancelable, view, 
    // detail, 
    // screenX, screenY, clientX, clientY, 
    // ctrlKey, altKey, shiftKey, metaKey, 
    // button, relatedTarget
    evt.initMouseEvent(event, opt.canBubble || true, opt.cancelable || true, window,
        opt.detail || 1, 
        opt.screenX || 0, opt.screenY || 0, opt.clientX || 0, opt.clientY || 0,
        opt.ctrlKey || false, opt.altKey || false, opt.shiftKey || false, opt.metaKey || false,
        opt.button || 0, opt.relatedTarget || null);
    target.dispatchEvent(evt);
}



})();
