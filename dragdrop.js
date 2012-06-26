(function(){

g.draggable = function(elem, opt){
    g(elem).draggable(opt);
    return g;
}
g.prototype.draggable = function(opt){
    opt = opt || {};
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        elem.draggable = true;
        elem.addEventListener(start, function(e){
            if(this.draggable !== true) return;
            var dragged = this;
            var startT = new Date();
            var startX = getPageX(e);
            var startY = getPageY(e);
            var offset = findPosition(this);
            var offsetX = this.offsetLeft;
            var offsetY = this.offsetTop;
            var endT = new Date();
            var endX;
            var endY;
            var thisX;
            var thisY;
            var shadowX = offset.x;
            var shadowY = offset.y;
            
            function touchmove(e){
                endX = getPageX(e);
                endY = getPageY(e);
                if(opt.touchmove){
                    thisX = endX - startX + offsetX;
                    thisY = endY - startY + offsetY;
                    var result = opt.touchmove.call(dragged, e, thisX, thisY, 
                        endX-startX, endY-startY, new Date()-(endT||startT));
                    endT = new Date();
                }
                if(result === false) return;
                if((opt.show === void 0) || (opt.show === 'shadow')){
                    shadowX = endX - startX + offset.x;
                    shadowY = endY - startY + offset.y;
                    (opt.positionShadow || positionShadow).call(shadow, shadowX, shadowY);
                }else if(opt.show === 'me'){
                    dragged.style.left = thisX + 'px';
                    dragged.style.top = thisY + 'px';
                }
            }
            function touchend(e){
                document.removeEventListener(move, touchmove);
                document.removeEventListener(end, touchend);
                if(opt.touchend){
                    var result = opt.touchend.call(dragged, e, thisX, thisY, 
                        endX-startX, endY-startY);
                }
                if(result === false) return;
                if((opt.show === void 0) || (opt.show === 'shadow')){
                    document.body.removeChild(shadow);
                }
            }
            document.addEventListener(move, touchmove, false);
            document.addEventListener(end, touchend, false);
            
            if(opt.touchstart){
                var result = opt.touchstart.call(this, e, startX, startY, offsetX, offsetY);
            }
            if(result === false) return;
            if((opt.show === void 0) || (opt.show === 'shadow')){
                var shadow = this.cloneNode(true);
                shadow.className = this.className;
                (opt.positionShadow || positionShadow).call(shadow, shadowX, shadowY)
                document.body.appendChild(shadow);
            }
        });
    }
}

var is_touch_supported = 'ontouchstart' in document.documentElement;
var start = is_touch_supported ? 'touchstart' : 'mousedown';
var move = is_touch_supported ? 'touchmove' : 'mousemove';
var end = is_touch_supported ? 'touchend' : 'mouseup';

function findPosition( obj ){
     var left =0, top = 0;
     while(obj.offsetParent){
          left += obj.offsetLeft;
          top += obj.offsetTop;
          obj = obj.offsetParent;
     }
     return {x: left, y: top};
}

function getPageX(e){
    return e.pageX || e.clientX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
}

function getPageY(e){
    return e.pageY || e.clientY || (e.touches && e.touches[0] ? e.touches[0].pageY : 0);
}

function positionShadow(left, top){
    this.style.cssText = 'position: absolute; top: '
        + top + 'px; left: ' + left + 'px; z-index: 999999; opacity: 0.5;';
}

})();
