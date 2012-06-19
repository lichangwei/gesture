
(function(){

var g = window.g = function(elem){
    if ( !(this instanceof arguments.callee) )
        return new arguments.callee(elem);
    var elems = arrayify(elem);
    if(!elems || elems.length === 0 ) return;
    for(var i = 0, len = elems.length; i < len; i++){
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
    for(var i = 0, len = event.length; i < len; i++){
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
        var target = e.original.target;
        var candidates = [];
        var find = 0;
        out: for(var i = 0, len = elems.length; i < len; i++){
            var list = elem[i].querySelectorAll(selector);
            for(var j = 0; j < list.length; j++){
                if( target === list[j] ){
                    find = 1;
                    break out;
                }
            }
        }
        find && callback.call(target, e)
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
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, false, false, {});
    evt.original = e;
    for(var k in attrs){
        if(attrs.hasOwnProperty(k)){
            evt[k] = attrs[k];
        }
    }
    (e.currentTarget || attrs.currentTarget || document).dispatchEvent(evt);
}

function addEvent(event){
    if( g[event] ){
        return console.error('You try to bind "' + event + '" event to g twice, pleace check.');
    }
    g[event] = function(elem, callback){
        var elems = arrayify(elem);
        for(var i = 0, len = elems.length; i < len; i++){
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
            var result = events[k].touchstart(e, startT, startX, startY);
            if(result === false) break;
        }
    }, false);
    elem.addEventListener(move, function(e){
        if(!status) return;
        endX = e.pageX;
        endY = e.pageY;
        for(var k in events){
            if(typeof events[k].touchmove !== 'function') continue;
            var result = events[k].touchmove(e, endX, endY);
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
            var result = events[k].touchend(e, endT, endX, endY, deltaT, deltaX, deltaY, distance);
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
