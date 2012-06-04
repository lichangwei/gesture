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
        var startT = +new Date();
        var mouseup = function(e){
            e.stopPropagation();
            e.preventDefault();
            unlisten(elem, endEvent, mouseup);
            var endT = +new Date();
            var type;
            if(endT - startT <= TAP_MAX_MS){
                type = 'tap';
            }else{
                type = 'taphold';
            };
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, true, true, {});
            //var event = new CustomEvent(type, {});
            elem.dispatchEvent(event);
        }
        listen(elem, endEvent, mouseup);
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
