
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
        var list = [];
        for(var i = 0; i < _list.length; i++){
            list.push(_list[i]);
        }
        var targets = e.detail.targets || [e.detail.original.target];
        var target;
        for(var i = 0; i < targets.length; i++){
            for(var o = targets[i]; o !== this; o = o.parentNode){
                if(list.indexOf(o) >= 0) break;
            }
            if( target === this ) return;
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
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, false, false, attrs);
    var target = e.currentTarget || attrs.target
        || attrs.targets[attrs.targets.length-1];
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
    'tap_interval': 500
};
var gesture_id = 0;

function init(elem){
    elem._gesture_id = ++gesture_id;
    
    var status;
    var startT, startX, startY;
    var endT, endX, endY;
    var deltaT, deltaX, deltaY;
    var distance;
    
    elem.addEventListener(start, function(e){
        if(e.touches && e.touches.length >= 2){
            status = 2;
        }else{
            status = 1;
        }
        startT = e.timeStamp;
        startX = e.pageX;
        startY = e.pageY;
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
        if(!status) return;
        endX = e.pageX;
        endY = e.pageY;
        for(var k in events){
            if(typeof events[k].touchmove !== 'function') continue;
            var result = events[k].touchmove.call(this, e, endX, endY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(end, function(e){
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
}

var is_touch_supported = 'ontouchstart' in document.documentElement;
var start = is_touch_supported ? 'touchstart' : 'mousedown';
var move = is_touch_supported ? 'touchmove' : 'mousemove';
var end = is_touch_supported ? 'touchend' : 'mouseup';
var leave = is_touch_supported ? 'touchleave' : 'mouseleave';

})();
