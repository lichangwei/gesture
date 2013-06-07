/*
 * @overview Regiester draggable & dropable action.
 * If the target browser supports the HTML5 draggable api, then uses it directly, otherwise simulate it with mouse/touch event.
 * @requires gesture.js
 */
(function(g){

'use strict';

/**
 * @member g.prototype.draggable
 * @desc draggable
 */
g.prototype.draggable = function(dragstart, drag, dragend){
  dragstart = dragstart || noop;
  drag      = drag      || noop;
  dragend   = dragend   || noop;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    if(g.support.draggable){
      elem.draggable = true;
      elem.addEventListener('dragstart', dragstart, false);
      elem.addEventListener('drag'     , drag     , false);
      elem.addEventListener('dragend'  , dragend  , false);
    }else{
      draggable(elem, dragstart, drag, dragend);
    }
  }
  return this;
};

/*
 * @member g.prototype.dropable
 * @desc dropable
 */
g.prototype.dropable = function(dragenter, dragover, dragleave, drop){
  dragenter  = dragenter || noop;
  dragover   = dragover  || noop;
  dragleave  = dragleave || noop;
  drop       = drop      || noop;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    if(g.support.draggable){
      dragenter && elem.addEventListener('dragenter', dragenter, false);
      dragover  && elem.addEventListener('dragover' , dragover , false);
      dragleave && elem.addEventListener('dragleave', dragleave, false);
      drop      && elem.addEventListener('drop'     , drop     , false);
    }else{
      elem.dropData = {
        dragenter: dragenter,
        dragover : dragover,
        dragleave: dragleave,
        drop     : drop
      };
    }
  }
  return this;
};

/*
 * @desc Simulate HTML5 draggable with the basic mouse/touch event.
 */
function draggable(elem, dragstart, drag, dragend){
  elem.addEventListener(touchstart, function(e){
    var dragData = {};
    var target = e.currentTarget;
    var to;
    var shadow;
    var top;
    var left;
    var startX = g.util.getPageX(e);
    var startY = g.util.getPageY(e);
    var endX = startX;
    var endY = startY;
    dragData.timeout = setTimeout(function(){
      var distance = g.util.getDistance([endX, endY], [startX, startY]);
      if(distance > g.opt('tap_max_distance')){
        return;
      }
      dragData.start = new Date();
      dragData.dataTransfer = new DataTransfer();
      dragstart.call(elem, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      // create shadow element.
      var rect = target.getBoundingClientRect();
      top = rect.top;
      left = rect.left;
      shadow = target.cloneNode(true);
      shadow.className      = target.className;
      shadow.style.cssText  = target.style.cssText;
      shadow.style.position = 'absolute';
      shadow.style.pointerEvents = 'none';
      shadow.style.top      = top + 'px';
      shadow.style.left     = left + 'px';
      shadow.style.opacity  = '0.5';
      document.body.appendChild(shadow);
    }, g.opt('dragstart_after_touchstart'));

    function ontouchmove(e){
      endX = g.util.getPageX(e);
      endY = g.util.getPageY(e);
      if( !dragData.start ) return;
      drag.call(elem);
      var from = dragData.target;
      // hide the shadow for getting the correct 'to' element by document.elementFromPoint.
      shadow.style.top = '-10000px';
      to = document.elementFromPoint(endX, endY);
      if( from !== to ){
        if(to && to.dropData){
          to.dropData.dragenter.call(to, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
          dragData.target = to;
        }else{
          dragData.target = null;
        }
        if(from && from.dropData){
          from.dropData.dragleave.call(from, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
        }
      }else{
        to.dropData.dragover.call(to, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      }
      shadow.style.left = endX - startX + left + 'px';
      shadow.style.top  = endY - startY + top  + 'px';
    }

    function ontouchend(e){
      document.removeEventListener(touchmove, ontouchmove, false);
      document.removeEventListener(touchend , ontouchend, false);
      if( !dragData.start ){
        clearTimeout(dragData.timeout);
        return;
      }
      document.body.removeChild(shadow);
      if(to && to.dropData){
        to.dropData.drop.call(to, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      }
      dragend.call(elem, new Event(elem, e, {dataTransfer: dragData.dataTransfer}));
    }

    document.addEventListener(touchmove, ontouchmove, false);
    document.addEventListener(touchend , ontouchend , false);
  }, false);
}

/*
 * @constructor DataTransfer
 * @desc Simulate the e.dataTransfer in the HTML5 drag & drop event.
 */
function DataTransfer(){
  this.data = {};
}
DataTransfer.prototype = {
  // copy: A copy of the source item is made at the new location.
  // move: An item is moved to a new location.
  // link: A link is established to the source at the new location.
  // none: The item may not be dropped.
  dropEffect: 'none', //'copy',
  // copy: A copy of the source item may be made at the new location.
  // move: An item may be moved to a new location.
  // link: A link may be established to the source at the new location.
  // copyLink: A copy or link operation is permitted.
  // copyMove: A copy or move operation is permitted.
  // linkMove: A link or move operation is permitted.
  // all: All operations are permitted.
  // none: the item may not be dropped.
  // uninitialized: the default value when the effect has not been set, equivalent to all.
  effectAllowed: '',
  setData: function(key, value){
    this.data[key] = value;
  },
  getData: function(key){
    return this.data[key];
  },
  clearData: function(){
    this.data = {};
  },
  setDragImage: function(img, x, y){
    throw 'Unimplemented.';
  },
  addElement: function(){
    throw 'Unimplemented.';
  }
};

var touchstart = g.event.touchstart;
var touchmove  = g.event.touchmove;
var touchend   = g.event.touchend;
var Event      = g.util.Event;

/*
 * @desc Check if html5 draggable api supported. User can use the mock api by adding below: g.support.draggable = false;
 */
g.support.draggable = (function(){
  // iOS & Android claims draggable but dosen't allow drag & drop
  // http://stackoverflow.com/a/6221626/1376981
  if( /(iPhone|iPod|iPad|Android)/.test(navigator.userAgent) ){
    return false;
  }
  var div = document.createElement('div');
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
})();

function noop(){}

})(g);