(function(){

var es = window.eventsimulator = {};
var simulator = {
    mouse: {
        events: ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'],
        create: fireMouseEvent,
    },
    touch: {
        events: ['touchstart', 'touchmove', 'touchend', 'touchcancel'],
        create: fireTouchEvent
    }
};

for(var t in simulator){
    var types = simulator[t];
    for(var i = 0; i < types.events.length; i++){
        var e = types.events[i];
        es[e] = (function(create, e){
            return function(target, opt){
                create.call(window, e, target, opt);
            };
        })(types.create, e);
    }
}

function fireMouseEvent(type, target, opt){
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
    evt.initMouseEvent(type, opt.canBubble || true, opt.cancelable || true, window,
        opt.detail || 1, 
        opt.screenX || 0, opt.screenY || 0, opt.clientX || 0, opt.clientY || 0,
        opt.ctrlKey || false, opt.altKey || false, opt.shiftKey || false, opt.metaKey || false,
        opt.button || 0, opt.relatedTarget || null);
    for(var k in opt){
        if(opt.hasOwnProperty(k)){
            evt[k] = opt[k];
        }
    }
    evt.isSimulated = true;
    target.dispatchEvent(evt);
}

function fireTouchEvent(type, target, opt){
    var data = createTouchEventData(type, target, opt);
    var evt = document.createEvent('TouchEvent');
    if (evt.initTouchEvent.length === 9) {
        evt.initTouchEvent(data.touches, data.targetTouches, data.changedTouches,
            type, data.view, data.screenX, data.screenY, data.clientX, data.clientY);
    }else{
        // type, bubbles, cancelable, view,
        // detail, screenX, screenY, pageX, pageY, 
        // ctrlKey, altKey, shiftKey, metaKey, 
        // touches, targetTouches, changedTouches
        // scale, rotation
        evt.initTouchEvent(type, data.bubbles, data.cancelable, data.view,
            data.detail, data.screenX, data.screenY, data.pageX, data.pageY, 
            data.ctrlKey, data.altKey, data.shiftKey, data.metaKey, 
            data.touches, data.targetTouches, data.changedTouches,
            data.scale, data.rotation);
    }
    evt.isSimulated = true;
    return target.dispatchEvent(evt);
}

function createTouchEventData(type, target, opt){
    opt = opt || {};
     var data = {
         type: type,
         timeStamp: +new Date(),
         bubbles: true,
         cancelable: true,
         detail: 1,
         screenX: 0,
         screenY: 0,
         pageX: 0,
         pageY: 0,
         clientX: 0,
         clientY: 0,
         ctrlKey: false,
         altKey: false,
         shiftKey: false,
         metaKey: false,
         scale: 1,
         rotation: 0
     };
     if (!serializable) {
         data.target = target;
         data.view = document.defaultView;
     }
     for(var k in data){
         if(opt.hasOwnProperty(k)){
             data[k] = opt[k];
         }
     }
     ['touches', 'targetTouches', 'changedTouches'].forEach(function(touchListName) {
         if(opt.hasOwnProperty(touchListName)){
             data[touchListName] = createTouchList(opt[touchListName], target);
         }else{
             data[touchListName] = createTouchList(data, target);
         }
     }, this);
     return data;
}

function createTouch(target, opt){
    if (!document.createTouch || serializable) {
        return {
            pageX: opt.pageX,
            pageY: opt.pageY,
            clientX: opt.pageX,
            clientY: opt.pageY,
            screenX: opt.pageX,
            screenY: opt.pageY,
            identifier: +opt.identifier || 0
        };
    }
    return document.createTouch(
        document.defaultView,
        target,
        +opt.identifier || 0,
        +opt.pageX || 0,
        +opt.pageY || 0,
        +opt.screenX || 0,
        +opt.screenY || 0);
}

function createTouchList(data, target){
    var touch,
        touches = [];
    for (var i = 0; i < data.length; i++) {
        if (!serializable && !data[i].target) {
            data[i].target = target;
        }
        touch = createTouch(data[i].target, data[i]);
        touches.push(touch);
    }
    if (!document.createTouchList || serializable) {
        return touches;
    }
    return document.createTouchList.apply(document, touches);
}

var serializable = false;

})();
