/**
 * @overview Define drag action.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

g.prototype.draggable = function(opt){
    opt = opt || {};
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        elem._draggable = true;
        elem.addEventListener(g.event.touchstart, function(e){
            var _t = this;
            this._drag_timeout = setTimeout(function(){
                ontouchstart.call(_t, e, opt);
            }, g.opt('tap_max_duration'));
        });
        elem.addEventListener(g.event.touchend, function(e){
            clearTimeout( this._drag_timeout );
        });
    }
};

function ontouchstart( e, opt ){
    e.preventDefault();
    
    if(this._draggable !== true) return;
    var dragged = this;
    var startT = new Date();
    var startX = getPageX(e);
    var startY = getPageY(e);
    var offset = findPosition(this);
    var style = window.getComputedStyle(this, null);
    var isAbsolute = style['position'] === 'absolute';
    var offsetX = isAbsolute ? this.offsetLeft : (parseInt(style['left']) || 0); 
    var offsetY = isAbsolute ? this.offsetTop : (parseInt(style['top']) || 0);
    var endT = new Date();
    var endX;
    var endY;
    var thisX;
    var thisY;
    var shadowX = offset.x;
    var shadowY = offset.y;
    
    function touchmove(e){
        e.preventDefault();
        
        endX = getPageX(e);
        endY = getPageY(e);
        thisX = endX - startX + offsetX;
        thisY = endY - startY + offsetY;
        if(opt.touchmove){
            var result = opt.touchmove.call(dragged, e, thisX, thisY, 
                endX-startX, endY-startY, new Date()-(endT||startT));
            endT = new Date();
        }
        if((opt.helper === void 0) || (opt.helper === 'shadow')){
            shadowX = endX - startX + offset.x;
            shadowY = endY - startY + offset.y;
            (opt.positionShadow || positionShadow).call(shadow, shadowX, shadowY);
        }else if(result !== false){
            dragged.style.left = thisX + 'px';
            dragged.style.top = thisY + 'px';
        }
    }
    function touchend(e){
        e.preventDefault();
        
        document.removeEventListener(g.event.touchmove, touchmove);
        document.removeEventListener(g.event.touchend, touchend);
        endX = getPageX(e);
        endY = getPageY(e);
        thisX = endX - startX + offsetX;
        thisY = endY - startY + offsetY;
        if(opt.touchend){
            var result = opt.touchend.call(dragged, e, thisX, thisY, 
                endX-startX, endY-startY, endX, endY);
        }
        if((opt.helper === void 0) || (opt.helper === 'clone')){
            document.body.removeChild(shadow);
        }
        if(result === false) return;
        dragged.style.left = thisX + 'px';
        dragged.style.top = thisY + 'px';
    }
    document.addEventListener(g.event.touchmove, touchmove, false);
    document.addEventListener(g.event.touchend, touchend, false);
    
    if(opt.touchstart){
        var result = opt.touchstart.call(this, e, startX, startY, offsetX, offsetY);
    }
    if((opt.helper === void 0) || (opt.helper === 'shadow')){
        var shadow = this.cloneNode(true);
        shadow.className = this.className;
        (opt.positionShadow || positionShadow).call(shadow, shadowX, shadowY);
        document.body.appendChild(shadow);
    }
    if(result === false) return;
}

var getPageX = g.util.getPageX;
var getPageY = g.util.getPageY;

function findPosition( obj ){
     var left =0, top = 0;
     while(obj.offsetParent){
          left += obj.offsetLeft;
          top += obj.offsetTop;
          obj = obj.offsetParent;
     }
     return {x: left, y: top};
}

function positionShadow(left, top){
    this.style.cssText = [
        'position: absolute',
        'top: ' + top + 'px',
        'left: ' + left + 'px',
        'z-index: 999999',
        'opacity: 0.5'
    ].join(';');
}

})(g);
