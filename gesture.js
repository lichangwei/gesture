
(function(){

var g = window.g = function(elem){
    if ( !(this instanceof arguments.callee) )
        return new arguments.callee(elem);
    var elems = arrayify(elem);
    if(!elems || elems.length === 0 ) return;
    for(var i = 0; i < elems.length; i++){
        if(!elems[i]._gesture_id) init(elems[i]);
    }
    this.elems = elems;
}
g.register = function(event, handler){
    var _t = this;
    if(event.search(/\s/) >= 0){
        event.replace(/\S+/g, function(evt){
            _t.register(evt, handler);
        });
        return _t;
    }
    events[event] = handler;
    event = event.split(',');
    for(var i = 0; i < event.length; i++){
        addEvent(event[i]);
    }
    return _t;
}
g.unregister = function(event){
    delete events[event];
    delete g[event];
    delete g.prototype[event];
    return this;
}
g.delegate = function(elem, selector, event, callback){
    var elems = arrayify(elem);
    g[event](elems, function(e){
        var _list = this.querySelectorAll(selector);
        if( _list.length === 0 ) return;
        var list = [];
        for(var i = 0; i < _list.length; i++){
            list.push(_list[i]);
        }
        var targets = e.data.targets || [e.data.original.target];
        var target;
        for(var i = 0; i < targets.length; i++){
            for(var o = targets[i]; o !== this; o = o.parentNode){
                if(list.indexOf(o) >= 0) break;
            }
            if(o === this) return;
            if(target && (target !== o)) return;
            target = o;
        }
        callback.call(target, e);
    });
    return this;
}
g.opt = function(k, v){
    if(typeof k !== 'string'){
        for(var i in k){
            opt[i] = k[i];
        }
        return;
    }
    return v === void 0 ? opt[k] : (opt[k]=v);
}
g.createEvent = function(name, e, attrs){
    attrs = attrs || {};
    attrs.original = e;
    if(is_customer_event_supported){
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(name, false, true, attrs);
    }else{
        var evt = document.createEvent('UIEvent');
        evt.initUIEvent(name, false, true);
    }
    evt.data = attrs;
    var target = attrs.currentTarget || e.currentTarget;
    (target || document).dispatchEvent(evt);
}

function addEvent(event){
    if( g[event] ){
        return console.error('You try to bind "' + event + '" event to g twice, pleace check.');
    }
    g[event] = function(elem, callback){
        var elems = arrayify(elem);
        for(var i = 0; i < elems.length; i++){
            elems[i].addEventListener(event, callback, false);
        }
    }
    g.prototype[event] = function(callback){
        return g[event](this.elems, callback)
    }
}

function arrayify( elem ){
    if(elem.jquery) return elem.get();
    if(elem instanceof HTMLElement) return [elem];
    return elem;
}
var events = {};
var opt = {
    'tap-max-distance': 30,
    'tap-max-delta-time': 300,
    'tap-interval': 250,
    
    'taphold-max-distance': 30,
    'taphold-min-delta-time': 301,
    
    'flick-min-x-or-y': 100,
    
    'zoomin-max-scale': 0.83,
    'zoomout-min-scale': 1.2
};
var gesture_id = 0;
var status_init = 0,
    status_touch_start = 1,
    status_touch_move = 2,
    status_gesture_start = 4;
    status_gesture_end = 8,
    status_touch_end = 16;

function init(elem){
    elem._gesture_id = ++gesture_id;
    
    var status = status_init;
    var startT, startX, startY;
    var endT, endX, endY;
    var deltaT, deltaX, deltaY;
    var distance;
    
    elem.addEventListener(start, function(e){
        status = 1;
        startT = e.timeStamp;
        startX = getPageX(e);
        startY = getPageY(e);
        endT = startT;
        endX = startX;
        endY = startY;

        for(var k in events){
            if(typeof events[k].touchstart !== 'function') continue;
            var result = events[k].touchstart.call(this, e, startT, startX, startY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(move, function(e){
        // The touchevents are not fired propperly 
        // if e.preventDefault() is not used on touchstart and touchmove
        // http://code.google.com/p/android/issues/detail?id=19827
        e.preventDefault();
        if(!status) return;
        endT = e.timeStamp;
        endX = getPageX(e);
        endY = getPageY(e);
        for(var k in events){
            if(typeof events[k].touchmove !== 'function') continue;
            var result = events[k].touchmove.call(this, e, endT, endX, endY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(end, function(e){
        e.preventDefault();
        if(!status) return;
        endT = e.timeStamp;
        deltaT = endT - startT;
        deltaX = endX - startX;
        deltaY = endY - startY;
        distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        for(var k in events){
            if(typeof events[k].touchend !== 'function') continue;
            var result = events[k].touchend.call(this, e, endT, endX, endY, deltaT, deltaX, deltaY, distance);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(leave, function(e){
        status = 0;
    }, false);
    
    elem.addEventListener('gesturestart', function(e){
        status = 0;
        for(var k in events){
            if(typeof events[k].gesturestart !== 'function') continue;
            var result = events[k].gesturestart.call(this, e);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener('gesturechange', function(e){
        status = 0;
        for(var k in events){
            if(typeof events[k].gesturechange !== 'function') continue;
            var result = events[k].gesturechange.call(this, e);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener('gestureend', function(e){
        status = 0;
        for(var k in events){
            if(typeof events[k].gestureend !== 'function') continue;
            var result = events[k].gestureend.call(this, e);
            if(result === false) break;
        }
    }, false);
    if(is_touch_supported && !is_gesture_supported){
        (function(){
            var status = 0;
            var t1, t2, distance, scale;
            elem.addEventListener(start, function(e){
                status++;
                if(status === 1) t1 = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                if(status >= 2) t2 = {x: e.touches[0].pageX, y: e.touches[0].pageY};
                if(!t2 || !t1) return;
                distance = Math.sqrt((t2.x-t1.x)*(t2.x-t1.x) + (t2.y-t1.y)*(t2.y-t1.y));
                scale = 1;
                g.createEvent('gesturestart', e, {
                    scale: scale
                });
            }, false);
            elem.addEventListener(move, function(e){
                if(!t2 || !t1 || !scale || !distance) return;
                var touch = e.touches[0];
                var x = touch.pageX;
                var y = touch.pageY;
                if( Math.sqrt((x-t1.x)*(x-t1.x) + (y-t1.y)*(y-t1.y)) 
                    > Math.sqrt((x-t2.x)*(x-t1.x) + (y-t2.y)*(y-t2.y)) ){
                    t2 = {x: x, y: y};
                }else{
                    t1 = {x: x, y: y};
                }
                var d = Math.sqrt((t2.x-t1.x)*(t2.x-t1.x) + (t2.y-t1.y)*(t2.y-t1.y));
                scale = d / distance;
                g.createEvent('gesturechange', e, {
                    scale: scale
                });
            }, false);
            elem.addEventListener(end, function(e){
                if(t2 && t1 && scale && distance){
                    g.createEvent('gestureend', e, {
                        scale: scale
                    });
                }
                status = t1 = t2 = scale = distance = 0;
            }, false);
        })();
    }
}

var is_touch_supported = 'ontouchstart' in document.documentElement;
var is_gesture_supported = 'ongesturestart' in document.documentElement;
var start = is_touch_supported ? 'touchstart' : 'mousedown';
var move = is_touch_supported ? 'touchmove' : 'mousemove';
var end = is_touch_supported ? 'touchend' : 'mouseup';
var leave = is_touch_supported ? 'touchleave' : 'mouseleave';
var is_customer_event_supported = true;
try{
    document.createEvent('CustomEvent');
}catch(e){
    is_customer_event_supported = false;
}

function getPageX(e){
    return e.pageX || e.clientX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
}

function getPageY(e){
    return e.pageY || e.clientY || (e.touches && e.touches[0] ? e.touches[0].pageY : 0);
}
})();
