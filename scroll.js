/**
 * @overview Register scroll/scrollhorizontal/scrollvertical event.<br/>
 *  Cannot used with delegate api.
 * @requires gesture.js
 */
(function(g){

'use strict';

var px = 'px';
var all = 'scroll';
var attrname = '_scroll';
var vertical = 'scrollvertical';
var horizontal = 'scrollhorizontal';

var datahub = {
    // {_gesture_id}: {
    //     set_animation: true,
    //     left: 20,
    //     top: 20,
    //     width: 20,
    //     height: 20,
    //     p_width: 20,
    //     p_height: 20,
    //     prevX: 20,
    //     prevY: 20,
    // },
};

g.register('scroll scrollhorizontal scrollvertical', {
    touchstart: function(e, startT, startX, startY){
        // if user don't handle scroll event, the same below.
        if( !this[attrname] ) return;
        var data = getData(this);
        
        var style = window.getComputedStyle(this, null);
        data.left = data.curr_left = parseInt(style.left) || 0;
        data.top = data.curr_top = parseInt(style.top) || 0;
        data.width = parseInt(style.width) || 0;
        data.height = parseInt(style.height) || 0;
        
        style = window.getComputedStyle(this.parentNode, null);
        data.p_width = parseInt(style.width) || 0;
        data.p_height = parseInt(style.height) || 0;
        
        data.prevX = startX;
        data.prevY = startY;
    },
    touchmove: function(e, endT, endX, endY, deltaT, deltaX, deltaY){
        if( !this[attrname] ) return;
        var data = getData(this);
        var lefttop = getLeftTop(this, data, deltaX, deltaY, false);
        var need = needMove(data, lefttop);
        if(need) move(this, data, lefttop);
        data.speed = [(endX-data.prevX)/deltaT, (endY-data.prevY)/deltaT];
        data.prevX = endX;
        data.prevY = endY;
    },
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if( !this[attrname] ) return;
        var data = getData(this);
        var lefttop = getLeftTop(this, data, deltaX, deltaY, true);
        var need = needMove(data, lefttop);
        var _t = this;
        if(need){
            var eventTarget = e.currentTarget;
            var webkitTransitionEnd = function(){
                // won't be fire if left and top don't change.
                _t.removeEventListener('webkitTransitionEnd', webkitTransitionEnd);
                setTransitionStyle(_t, no_animation_style);
                g.createEvent(data.scroll, e, {
                    eventTarget: eventTarget
                });
            };
            _t.addEventListener('webkitTransitionEnd', webkitTransitionEnd, false);
            setTransitionStyle(_t, default_animation_style);
            move(_t, data, lefttop);
        }
    }
}, function(event){
    this[attrname] = event;
});

function getLeftTop(elem, data, deltaX, deltaY, checkBoundaries){
    var lefttop = {};
    if(data.scroll === all || data.scroll === horizontal){
        var left = data.left + deltaX;
        if(left > 0) left = checkBoundaries ? 0 : left / 3;
        var min = data.p_width - data.width;
        if(left < min) left = checkBoundaries ? min : left;
        lefttop.left = Math.floor(left);
    }
    if(data.scroll === all || data.scroll === vertical){
        var top = data.top + deltaY;
        if(top > 0) top = checkBoundaries ? 0 : top / 3;
        var min = data.p_height - data.height;
        if(top < min) top = checkBoundaries ? min : top;
        lefttop.top = Math.floor(top);
    }
    return lefttop;
}

function needMove(prev, now){
    return now.left !== prev.curr_left || now.top !== prev.curr_top;
}

function move(elem, data, lefttop){
    if(lefttop.left !== void 0){
        elem.style.left = lefttop.left + 'px';
        data.curr_left = lefttop.left;
    }
    if(lefttop.top !== void 0){
        elem.style.top = lefttop.top + 'px';
        data.curr_top = lefttop.top;
    }
}

var css_prefix = '-webkit-';
var no_animation_style = 'left 0 cubic-bezier(0,0,0.25,1) 0, top 0 cubic-bezier(0,0,0.25,1) 0';
var default_animation_style = 'left 300ms cubic-bezier(0,0,0.25,1) 0, top 300ms cubic-bezier(0,0,0.25,1) 0';

function setTransitionStyle(elem, style){
    elem.style[css_prefix + 'transition'] = style;
}

function getData(elem){
    var key = elem._gesture_id;
    var data = datahub[key];
    if( !data ){
        data = datahub[key] = {};
        setTransitionStyle(elem, no_animation_style);
        data.set_animation = true;
        data.scroll = elem[attrname];
    }
    return data;
}

})(g);