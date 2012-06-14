(function(window){

HTMLElement.prototype.gesture = function(event, fn){
    if(!this._gesture_inited) init(this);
    listen(this, event, fn);
}
HTMLElement.prototype.ungesture = function(event, fn){
    if(!this._gesture_inited) return;
    unlisten(this, event, fn);
}

function init(elem){
    elem._gesture_inited = true;
    listen(elem, startEvent, function(e){
        e.stopPropagation();
        e.preventDefault();
        var startT = new Date();
        var startX = e.pageX || e.targetTouches[0].pageX;
        var startY = e.pageY || e.targetTouches[0].pageY;
        var currX;
        var currY;
        var isPressed = false;
        var isMoved = false;
        var timeout = setTimeout(function(){
            isPressed = true;
        }, TAP_MAX_MS);
        function move(e){
            e.stopPropagation();
            e.preventDefault();
            isMoved = true;
            currX = e.pageX || e.targetTouches[0].pageX;
            currY = e.pageY || e.targetTouches[0].pageY;
        }
        function end(e){
            e.stopPropagation();
            e.preventDefault();
            clearTimeout(timeout);
            unlisten(elem, moveEvent, move);
            unlisten(elem, endEvent, end);
            isPressed = (new Date() - startT > TAP_MAX_MS) || isPressed;
            if( isMoved ){
                isMoved = Math.sqrt(Math.pow(currX-startX, 2) + Math.pow(currY-startY, 2)) > 50;
            }
            var type;
            if( isMoved ){
                type = isPressed ? 'drag' : 'flick';
            }else{
                type = isPressed ? 'press' : 'tap';
            }
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, true, true, {});
            //var event = new CustomEvent(type, {});
            elem.dispatchEvent(event);
        }
        listen(elem, moveEvent, move);
        listen(elem, endEvent, end);
    });
}

function listen(elem, event, fn){
    if(elem.removeEventListener){
        elem.addEventListener(event, fn, false);
    }else{
        fn._wrap = function(e){
            e = extend(e||window.event, ie_event_extends);
            fn( e );
        };
        elem.attachEvent(event, fn._wrap);
    }
}

function unlisten(elem, event, fn){
    if(elem.removeEventListener){
        elem.removeEventListener(event, fn);
    }else{
        elem.detachEvent(event, fn._wrap);
    }
}

function extend(target, source){
    for(var k in source){
        target[k] = source[k];
    }
    return target;
}

var TAP_MAX_MS = 300;

var is_ie = navigator.userAgent.indexOf('MSIE') >= 0;
var is_touch_supported = 'ontouchstart' in document.documentElement;
var startEvent = is_touch_supported ? 'touchstart' : 'mousedown';
var moveEvent = is_touch_supported ? 'touchmove' : 'mousemove';
var endEvent = is_touch_supported ? 'touchend' : 'mouseup';

var ie_event_extends = {
    stopPropagation: function(){
        this.cancelBubble = true;
    },
    preventDefault: function(){
        this.returnValue = false;
    }
};

})(window);
