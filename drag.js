/**
 * @overview Define drag action.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

g.prototype.draggable = function(opt){
  opt = opt || {};
  if(typeof opt.container === 'string'){
    opt.container = document.querySelector(opt.container);
  }
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    elem.addEventListener(g.event.touchstart, function(e){
      var _t = this;
      this._drag_timeout = setTimeout(function(){
        ontouchstart.call(_t, e, opt);
      }, g.opt('tap_max_duration'));
    }, false);
    elem.addEventListener(g.event.touchend, function(e){
      clearTimeout( this._drag_timeout );
    }, false);
  }
};

function ontouchstart( e, opt ){
  var me = this;
  // cannot use e.timeStamp, because of the setTimeout above.
  var startT = new Date();
  var startTouchX = getPageX(e);
  var startTouchY = getPageY(e);
  var rect = me.getBoundingClientRect();

  var style = window.getComputedStyle(me, null);
  var isAbsolute = style['position'] === 'absolute';
  var startElemX = isAbsolute ? me.offsetLeft : (parseInt(style['left'], 10) || 0);
  var startElemY = isAbsolute ? me.offsetTop :  (parseInt(style['top'] , 10) || 0);
  var time;
  var touchX;
  var touchY;
  var elemX;
  var elemY;
  var absoluteElemX;
  var absoluteElemY;
  var returnValue;

  var container = opt.container instanceof HTMLElement ? opt.container.getBoundingClientRect() : opt.container;

  if(opt.touchstart){
    returnValue = opt.touchstart.call(me, e, startTouchX, startTouchY, startElemX, startElemY);
  }
  if((opt.helper === void 0) || (opt.helper === 'shadow')){
    var shadow = me.cloneNode(true);
    shadow.className = me.className;
    (opt.positionShadow || positionShadow).call(shadow, rect.left, rect.top);
    document.body.appendChild(shadow);
  }
  
  function touchmove(e){
    e.preventDefault();
    // get left and top of touch/mouse
    touchX = getPageX(e);
    touchY = getPageY(e);
    absoluteElemX = touchX - startTouchX + rect.left;
    absoluteElemY = touchY - startTouchY + rect.top;

    if(container){
      absoluteElemX = Math.min(absoluteElemX, container.right - rect.width);
      absoluteElemX = Math.max(absoluteElemX, container.left);
      absoluteElemY = Math.min(absoluteElemY, container.bottom - rect.height);
      absoluteElemY = Math.max(absoluteElemY, container.top);
    }

    // get left and top of the target element
    elemX = absoluteElemX - rect.left + startElemX;
    elemY = absoluteElemY - rect.top  + startElemY;
    
    if(opt.touchmove){
      returnValue = opt.touchmove.call(me, e, elemX, elemY, absoluteElemX - rect.left, absoluteElemY - rect.top, e.timeStamp-startT);
    }
    if((opt.helper === void 0) || (opt.helper === 'shadow')){
      (opt.positionShadow || positionShadow).call(shadow, absoluteElemX, absoluteElemY);
    }else if(returnValue !== false){
      me.style.left = elemX + 'px';
      me.style.top  = elemY + 'px';
    }
  }
  function touchend(e){
    e.preventDefault();
    document.removeEventListener(g.event.touchmove, touchmove);
    document.removeEventListener(g.event.touchend,  touchend);
    if(opt.touchend){
      returnValue = opt.touchend.call(me, e, elemX, elemY, absoluteElemX - rect.left, absoluteElemY - rect.top, e.timeStamp-startT);
    }
    if((opt.helper === void 0) || (opt.helper === 'clone')){
      document.body.removeChild(shadow);
    }
    if(returnValue === false) return;
    me.style.left = elemX + 'px';
    me.style.top  = elemY + 'px';
  }
  document.addEventListener(g.event.touchmove, touchmove, false);
  document.addEventListener(g.event.touchend,  touchend,  false);
}

var getPageX = g.util.getPageX;
var getPageY = g.util.getPageY;

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
