
(function(){

'use strict';

var g = window.g = function(elem){
    // if call g function with out 'new' 
    if ( !(this instanceof g) )
        return new g(elem);
    var elems = this.elems = arrayify(elem);
    if(!elems || elems.length === 0 ) return;
    for(var i = 0; i < elems.length; i++){
        if(!elems[i]._gesture_id) init(elems[i]);
    }
};

g.prototype.on = function(type, selector, data, callback){
    var _t = this;
    // allow to bind 2+ events at the same time
    if(type.search(/\s/) >= 0){
        type.replace(/\S+/g, function(evt){
            _t.on(evt, selector, data, callback);
        });
        return _t;
    }
    // split event type & namespace
    if(type.indexOf('.') !== -1){
        var array = type.split('.');
        type = array[0];
        var namespace = array[1];
    }
    _t[type](selector, data, callback, namespace);
    return this;
};

// off(type[, selector][, callback])
g.prototype.off = function(type, selector, callback){
    var _t = this;
    // allow to remove 2+ events at the same time
    if(type.search(/\s/) >= 0){
        type.replace(/\S+/g, function(evt){
            _t.off(evt, selector, callback);
        });
        return _t;
    }
    // split event type & namespace
    if(type.indexOf('.') !== -1){
        var array = type.split('.');
        type = array[0];
        var namespace = array[1];
    }
    // case: off('tap', '.delete', fn)
    if(typeof selector === 'string' && typeof callback === 'function'){
        var identification = type + '-' + selector;
        callback = callback._g_cbs && callback._g_cbs[identification];
    }else if(typeof selector === 'function'){ // case: off('tap', fn)
        callback = selector;
        selector = void 0;
    }
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        var cbs = callbacks[elem._gesture_id];
        if( !cbs || cbs.length === 0 ) continue;
        // remove the callbacks that match the condition
        for(var j = cbs.length - 1; j >= 0; j--){
            var cb = cbs[j];
            if( (!type || (type === cb.type))
                && (!selector || (selector === cb.selector))
                && (!namespace || (namespace === cb.namespace))
                && (!callback || (callback === cb.callback)) ){
                elem.removeEventListener(cb.type, cb.callback);
                cbs.splice(j, 1);
            }
        }
    }
    return this;
};

g.prototype.trigger = function(type){
    for(var i = 0; i < this.elems.length; i++){
        g.createEvent(type, null, {
            eventTarget: this.elems[i],
            canBubble: true
        });
    }
    return this;
}

g.register = function(event, handler, ifBind){
    if( events[event] ) return console.error('"' + event + '" cannot be regiested twice.');
    events[event] = handler;
    event = event.split(/\s/);
    for(var i = 0; i < event.length; i++){
        register(event[i], ifBind);
    }
    return this;
};
g.unregister = function(event){
    delete events[event];
    event = event.split(/\s/);
    for(var i = 0; i < event.length; i++){
        delete g.prototype[event[i]];
    }
    return this;
};

g.opt = function(k, v){
    if(typeof k !== 'string'){
        for(var i in k){
            opt[i] = k[i];
        }
        return;
    }
    return v === void 0 ? opt[k] : (opt[k]=v);
};

g.createEvent = function(name, e, attrs){
    attrs = attrs || {};
    e = e || {};
    // some browsers don't support CustomEvent
    if(is_customer_event_supported){
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(name, attrs.canBubble || false, true, 1);
    }else{
        var evt = document.createEvent('UIEvent');
        evt.initUIEvent(name, attrs.canBubble || false, true, document.defaultView, 1);
    }
    for(var k in attrs){
        if(attrs.hasOwnProperty(k)){
            evt[k] = attrs[k];
        }
    }
    evt.original = e;
    evt.px = getPageX(e);
    evt.py = getPageY(e);
    var target = attrs.eventTarget || e.currentTarget;
    (target || document).dispatchEvent(evt);
};

function register(type, ifBind){
    g.prototype[type] = function(selector, data, callback, namespace){
        if(typeof selector !== 'string'){
            namespace = callback;
            callback = data;
            data = selector;
            selector = void 0;
        }
        if(typeof data !== 'object'){
            namespace = callback;
            callback = data;
            data = void 0;
        }
        var cb = callback;
        if( selector ){
            var cbs = callback._g_cbs = callback._g_cbs || {};
            var identification = type + '-' + selector;
            if( !cbs[identification] ){
                cbs[identification] = function(e){
                    var _list = this.querySelectorAll(selector);
                    if( _list.length === 0 ) return;
                    var list = [];
                    for(var i = 0; i < _list.length; i++){
                        list.push(_list[i]);
                    }
                    var target;
                    var eventType = e.toString();
                    if(eventType === '[object CustomEvent]' 
                        || eventType === '[object UIEvent]'){
                        var targets = e.targets || (e.eventTarget && [e.eventTarget]) || (e.original && [e.original.target]);
                        for(var i = 0; targets && i < targets.length; i++){
                            for(var o = targets[i]; o !== this; o = o.parentNode){
                                if(list.indexOf(o) >= 0) break;
                            }
                            if(o === this) return;
                            if(target && (target !== o)) return;
                            target = o;
                        }
                    }else{ // for orignal events, such as mouseup, touchend etc.
                        target = e.target;
                    }
                    target && callback.call(target, e);
                };
            };
            cb = cbs[identification];
        }
        for(var i = 0; i < this.elems.length; i++){
            var elem = this.elems[i];
            ifBind && ifBind.call(elem, type);
            elem.addEventListener(type, cb, false);
            var cbs = callbacks[elem._gesture_id] = (callbacks[elem._gesture_id] || []);
            cbs.push({
                type: type,
                selector: selector,
                namespace: namespace,
                callback: cb
            });
        }
        return this;
    };
};

function arrayify( elem ){
    if(elem.jquery) return elem.get();
    // document is instance of HTMLDocument(but Document in IE)
    if(elem instanceof HTMLElement || elem === document) return [elem];
    if(typeof elem === 'string'){
        elem = document.querySelectorAll(elem);
    }
    // Here we recommend to use below methods to get an element collection.
    // getElementsByClassName
    // getElementsByTagName
    // getElementsByName
    // querySelectorAll
    // children attribute
    
    // and we don't handle these collections:
    // HTMLOptionsCollection, HTMLSelectElement
    // HTMLFormElement, HTMLAllCollection
    if(elem instanceof NodeList || elem instanceof HTMLCollection){
        var array = [];
        for(var i = 0; i < elem.length; i++){
            array.push(elem[i]);
        }
        return array;
    }
    return elem;
}
var events = {};
var callbacks = {};
var gesture_id = 0;

var opt = {
    'tap-max-distance': 30,
    'tap-max-duration': Number.MAX_VALUE,
    
    'doubletap_max_interval': 250,
    
    'flick-min-x-or-y': 30,
    
    'zoomout-max-scale': 0.83,
    'zoomin-min-scale': 1.2
};


function init(elem){
    elem._gesture_id = ++gesture_id;
    
    var status = 0;
    var startT, startX, startY;
    var endT, endX, endY;
    var deltaT, deltaX, deltaY;
    var distance;
    
    elem.addEventListener(touchstart, function(e){
        // e.preventDefault();
        status = 1;
        endT = startT = e.timeStamp;
        endX = startX = getPageX(e);
        endY = startY = getPageY(e);

        for(var k in events){
            var ek = events[k];
            if(typeof ek.touchstart !== 'function') continue;
            var result = ek.touchstart.call(this, e, startT, startX, startY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(touchmove, function(e){
        // The touchevents are not fired propperly 
        // if e.preventDefault() is not used on touchstart and touchmove
        // http://code.google.com/p/android/issues/detail?id=19827
        // e.preventDefault();
        if(!status) return;
        endT = e.timeStamp;
        endX = getPageX(e);
        endY = getPageY(e);
        deltaT = endT - startT;
        deltaX = endX - startX;
        deltaY = endY - startY;
        for(var k in events){
            var ek = events[k];
            if(typeof ek.touchmove !== 'function') continue;
            var result = ek.touchmove.call(this, e, endT, endX, endY, deltaT, deltaX, deltaY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(touchend, function(e){
        // e.preventDefault();
        if(!status) return;
        endT = e.timeStamp;
        deltaT = endT - startT;
        deltaX = endX - startX;
        deltaY = endY - startY;
        distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        for(var k in events){
            var ek = events[k];
            if(typeof ek.touchend !== 'function') continue;
            var result = ek.touchend.call(this, e, endT, endX, endY, deltaT, deltaX, deltaY, distance);
            if(result === false) break;
        }
        status = 0;
    }, false);
    elem.addEventListener(touchleave, function(e){
        status = 0;
    }, false);
    
    elem.addEventListener(gesturestart, function(e){
        status = 0;
        for(var k in events){
            var ek = events[k];
            if(typeof ek.gesturestart !== 'function') continue;
            var result = ek.gesturestart.call(this, e);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(gesturechange, function(e){
        status = 0;
        for(var k in events){
            var ek = events[k];
            if(typeof ek.gesturechange !== 'function') continue;
            var result = ek.gesturechange.call(this, e);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(gestureend, function(e){
        status = 0;
        for(var k in events){
            var ek = events[k];
            if(typeof ek.gestureend !== 'function') continue;
            var result = ek.gestureend.call(this, e);
            if(result === false) break;
        }
    }, false);
    if(is_touch_supported && !is_gesture_supported){
        (function(){
            var start, end, rotation;
            elem.addEventListener(touchstart, function(e){
                if(e.touches.length < 2) return;
                start = getInfo(e);
                rotation = 0;
                g.createEvent(gesturestart, e, {
                    scale: 1,
                    rotation: rotation
                });
            }, false);
            elem.addEventListener(touchmove, function(e){
                if(e.touches.length < 2) return;
                if(!start) return;
                end = getInfo(e);
                var _rotation = end.angle - start.angle;
                if(_rotation - rotation > 90){
                    _rotation = _rotation - 180;
                }else if(_rotation - rotation < -90){
                    _rotation = _rotation + 180;
                }
                rotation = _rotation;
                g.createEvent(gesturechange, e, {
                    scale: end.distance/start.distance,
                    rotation: _rotation
                });
            }, false);
            elem.addEventListener(touchend, function(e){
                if(e.touches.length > 1) return;
                if(!start) return;
                g.createEvent(gestureend, e, {
                    scale: end.distance/start.distance,
                    rotation: rotation
                });
                start = end = 0;
            }, false);
        })();
    }
}

var is_customer_event_supported = !!window.CustomEvent;
var is_touch_supported = 'ontouchstart' in document.documentElement;
var is_gesture_supported = 'ongesturestart' in document.documentElement;

var touchstart = is_touch_supported ? 'touchstart' : 'mousedown';
var touchmove = is_touch_supported ? 'touchmove' : 'mousemove';
var touchend = is_touch_supported ? 'touchend' : 'mouseup';
var touchleave = is_touch_supported ? 'touchleave' : 'mouseleave';

var gesturestart = 'gesturestart';
var gesturechange = 'gesturechange';
var gestureend   = 'gestureend';

// allow user bind some standard events.
g.register([touchstart, touchmove, touchend].join(' '), {});

g.event = {
    touchstart: touchstart,
    touchmove: touchmove,
    touchend: touchend,
};

g.support = {
    touch: is_touch_supported,
    gesture: is_gesture_supported
};

g.util = {
    getPageX: getPageX,
    getPageY: getPageY,
    getDistance: getDistance
};

function getPageX(e){
    return e.pageX || e.clientX 
        || (e.touches && e.touches[0] ? e.touches[0].pageX : 0)
        || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].pageX : 0);
}

function getPageY(e){
    return e.pageY || e.clientY 
        || (e.touches && e.touches[0] ? e.touches[0].pageY : 0)
        || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].pageY : 0);
}

function getInfo(e){
    var t0 = e.touches[0];
    var t1 = e.touches[1];
    var p0 = [t0.pageX, t0.pageY];
    var p1 = [t1.pageX, t1.pageY];
    return {
        distance: getDistance(p0, p1),
        angle: getAngle(p0, p1)
    };
}

function getAngle(p0, p1){
    var deltaX = p0[0]-p1[0];
    var deltaY = p0[1]-p1[1];
    if(deltaX === 0){
        return deltaY === 0 ? 0 : (deltaY > 0 ? 90 : -90);
    }
    return Math.atan(deltaY / deltaX) * 180 / Math.PI;
}

function getDistance(p0, p1){
    return Math.sqrt((p1[0]-p0[0])*(p1[0]-p0[0]) + (p1[1]-p0[1])*(p1[1]-p0[1]));
}

})();
