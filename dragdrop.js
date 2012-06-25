(function(){

g.draggable = function(elem, touchstart, touchmove, touchend){
    g(elem).draggable(touchstart, touchmove, touchend);
    return g;
}
g.prototype.draggable = function(touchstart, touchmove, touchend){
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        elem.draggable = true;
        elem.addEventListener(start, function(e){
            if(this.draggable !== true) return;
            dragged = this;
            var offset = findPosition(this);
            offsetX = (e.pageX || e.clientX || e.touches[0].pageX) - offset[0];
            offsetY = (e.pageY || e.clientY || e.touches[0].pageY) - offset[1];
            shadow = this.cloneNode(true);
            shadow.className = this.className;
            shadow.style.cssText = 'position: absolute; z-index: 999999; opacity: 0.5; top: '
                + offset[1] + 'px; left: ' + offset[0] + 'px';
            document.body.appendChild(shadow);
            touchstart.call(this, e);
        });
    }
    document.addEventListener(move, function(e){
        if(!dragged) return;
        if(!shadow) return;
        shadow.style.cssText = 'position: absolute; z-index: 999999; opacity: 0.5; top: '
            + ((e.pageY || e.clientY || e.touches[0].pageY) - offsetY)+ 'px; left: '
            + ((e.pageX || e.clientX || e.touches[0].pageX) - offsetX) + 'px';
        touchmove.call(dragged, e);
    });
    document.addEventListener(end, function(e){
        if(!dragged) return;
        if(!shadow) return;
        touchend.call(dragged, e);
        document.body.removeChild(shadow);
        dragged = null;
        shadow = null;
    });
}

var dragged;
var shadow;
var offsetX;
var offsetY;

var is_touch_supported = 'ontouchstart' in document.documentElement;
var start = is_touch_supported ? 'touchstart' : 'mousedown';
var move = is_touch_supported ? 'touchmove' : 'mousemove';
var end = is_touch_supported ? 'touchend' : 'mouseup';

function findPosition( obj ){
     var left =0, top = 0, offsetParent;
     while(offsetParent = obj.offsetParent){
          left += obj.offsetLeft;
          top += obj.offsetTop;
          if(offsetParent === document.body) break;
     }
     return [left, top];
}


})();
