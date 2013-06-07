/**
 * @overview Define drag action.
 * @requires gesture.js
 */
(function(g){

'use strict';

/*
 * @desc define the drag action.
 * @param {object} opt optinal.
 *    {function} opt.touchstart.
 *    {function} opt.touchmove.
 *      return false then you can position this element yourself.
 *    {function} opt.touchend.
 *      return false then you can position this element yourself.
 *    {string} opt.helper. How to indicate current position.
 *      'clone': default value. Clone the draggable element.
 *      'no': Move the draggable element in real time.
 *    {function} opt.positionShadow.
 *    {element, string, object} opt.container. the darggable element cannot move out of this element/area.
 *      element specify the container element.
 *      string specify the css selector of the container element.
 *      object specify it's the boundary of the area. typically it contains top, left, width(or right),
 *        height(or bottom).
 */
g.prototype.drag = function(opt){
  opt = opt || {};
  opt.helper = opt.helper || 'clone';
  opt.positionShadow = opt.positionShadow || positionShadow;
  if(typeof opt.container === 'string'){
    opt.container = document.querySelector(opt.container);
  }
  for(var i = 0; i < this.elems.length; i++){
    bindEvents(this.elems[i], opt);
  }
};

function bindEvents(elem, opt){
  var ontouchmove;
  var timeout;
  elem.addEventListener(touchstart, function(e){
    var _t = elem;
    var startX = getPageX(e);
    var startY = getPageY(e);
    
    ontouchmove = function(e){
      var endX = getPageX(e);
      var endY = getPageY(e);
      var distance = g.util.getDistance([endX, endY], [startX, startY]);
      if(distance > g.opt('tap_max_distance')){
        document.removeEventListener(touchmove, ontouchmove, false);
        clearTimeout( timeout );
      }
    };

    timeout = setTimeout(function(){
      elem.removeEventListener(touchmove, ontouchmove, false);
      ontouchstart.call(_t, e, opt);
    }, g.opt('dragstart_after_touchstart'));

    document.addEventListener(touchmove, ontouchmove, false);
  }, false);
  
  elem.addEventListener(touchend, function(e){
    document.removeEventListener(touchmove, ontouchmove, false);
    clearTimeout( timeout );
  }, false);
}

function ontouchstart(e, opt){
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
    opt.touchstart.call(me, e, startTouchX, startTouchY, startElemX, startElemY);
  }
  if(opt.helper === 'clone'){
    var shadow = me.cloneNode(true);
    shadow.className = me.className;
    opt.positionShadow.call(shadow, rect.left, rect.top);
    document.body.appendChild(shadow);
  }
  
  function ontouchmove(e){
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
      returnValue = opt.touchmove.call(
        me, e, elemX, elemY, absoluteElemX - rect.left, absoluteElemY - rect.top, e.timeStamp-startT);
    }
    if(opt.helper === 'clone'){
      opt.positionShadow.call(shadow, absoluteElemX, absoluteElemY);
    }else if(returnValue !== false){
      me.style.left = elemX + 'px';
      me.style.top  = elemY + 'px';
    }
  }
  function ontouchend(e){
    e.preventDefault();
    document.removeEventListener(touchmove, ontouchmove, false);
    document.removeEventListener(touchend,  ontouchend, false);
    if(opt.touchend){
      returnValue = opt.touchend.call(
        me, e, elemX, elemY, absoluteElemX - rect.left, absoluteElemY - rect.top, e.timeStamp-startT);
    }
    if(opt.helper === 'clone'){
      document.body.removeChild(shadow);
    }
    if(returnValue === false) return;
    me.style.left = elemX + 'px';
    me.style.top  = elemY + 'px';
  }
  document.addEventListener(touchmove, ontouchmove, false);
  document.addEventListener(touchend,  ontouchend,  false);
}

var getPageX = g.util.getPageX;
var getPageY = g.util.getPageY;
var touchstart = g.event.touchstart;
var touchmove = g.event.touchmove;
var touchend = g.event.touchend;

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
