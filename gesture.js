
(function(){

var g = window.g = function(elem){
    var elems = arrayify(elem);
    if(!elems || elems.length === 0 ) return;
    if ( !(this instanceof arguments.callee) )
        return new arguments.callee(elems);
    for(var i = 0, len = elems.length; i < len; i++){
        if(!elems[i]._gesture_inited) init(elems[i]);
    }
    this.elems = elems;
}
g.register = function(event, handler){
    events[event] = handler;
    if( g[event] ) return;
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
    })
}
g.opt = function(k, v){
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
    (e.currentTarget || document).dispatchEvent(evt);
}

function arrayify( elem ){
    if(elem.jquery) return elem.get();
    if(elem instanceof HTMLElement) return [elem];
    return elem;
}
var events = {};
var opt = {};

function init(elem){
    elem._gesture_inited = true;
    elem.addEventListener(start, function(e){
        var startT = e.timeStamp;
        var startX = e.pageX;
        var startY = e.pageY;
        var endT = startT;
        var endX = startX;
        var endY = startY;
        var deltaT;
        var deltaX;
        var deltaY;
        var distance;
        for(var k in events){
            if(typeof events[k].touchstart !== 'function') continue;
            var result = events[k].touchstart(e, startT, startX, startY);
            if(result === false) break;
        }
        function touchmove(e){
            endX = e.pageX;
            endY = e.pageY;
            for(var k in events){
                if(typeof events[k].touchmove !== 'function') continue;
                var result = events[k].touchmove(e, endX, endY);
                if(result === false) break;
            }
        }
        function touchend(e){
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
            elem.removeEventListener(move, touchmove);
            elem.removeEventListener(end, touchend);
            elem.removeEventListener(leave, touchleave);
        }
        function touchleave(e){
            elem.removeEventListener(move, touchmove);
            elem.removeEventListener(end, touchend);
            elem.removeEventListener(leave, touchleave);
        }
        elem.addEventListener(move, touchmove, false);
        elem.addEventListener(end, touchend, false);
        elem.addEventListener(leave, touchleave, false);
    }, false);
}

var is_touch_supported = 'ontouchstart' in document.documentElement;
var start = is_touch_supported ? 'touchstart' : 'mousedown';
var move = is_touch_supported ? 'touchmove' : 'mousemove';
var end = is_touch_supported ? 'touchend' : 'mouseup';
var leave = is_touch_supported ? 'touchleave' : 'mouseleave';

})();
