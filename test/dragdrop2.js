/*
 * @overview Regiester draggable & dropable action. 
 * If the target browser supports the HTML5 draggable api, then uses it directly, otherwise simulate it with mouse/touch event. 
 * @requires gesture.js
 */
(function(){

/**
 * @member g.prototype.draggable
 * @desc 
 */
g.prototype.draggable = function(dragstart, drag, dragend){
  dragstart = dragstart || noop;
  drag      = drag      || noop;
  dragend   = dragend   || noop;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    if(draggableSupported){
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
 * @desc 
 */
g.prototype.dropable = function(dragenter, dragover, dragleave, drop){
  dragenter  = dragenter || noop;
  dragover   = dragover  || noop;
  dragleave  = dragleave || noop;
  drop       = drop      || noop;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    if(draggableSupported){
      dragenter && elem.addEventListener('dragenter', dragenter, false);
      dragover  && elem.addEventListener('dragover' , dragover , false);
      dragleave && elem.addEventListener('dragleave', dragleave, false);
      drop      && elem.addEventListener('drop'     , drop     , false);
    }else{
      elem.gdrop = {
        dragenter: dragenter,
        dragover : dragover,
        dragleave: dragleave,
        drop     : drop
      }
    }
  }
  return this;
};

/*
 * @desc Simulate HTML5 draggable with the basic mouse/touch event.
 */
function draggable(elem, dragstart, drag, dragend){
  elem.addEventListener(touchstart, function(e){
    e.preventDefault();
    var dragData = {};
    drag.timeout = setTimeout(function(){
      dragData.start = new Date();
      dragData.dataTransfer = new DataTransfer();
      dragstart.call(elem, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      if( dataDrag.effectAllowed === 'copy' ){
        // @TODO 
      }
    }, 300);

    function ontouchmove(e){
      e.preventDefault();
      if( !dragData.start ) return;
      drag.call(elem);
      var pageX = g.util.getPageX(e);
      var pageY = g.util.getPageY(e);
      var from = dragData.target;
      var to = document.elementFromPoint(pageX, pageY);
      if( from !== to ){
        if(to && to.gdrop){
          to.gdrop.dragenter.call(to, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
          dragData.target = to;
        }else{
          dragData.target = null;
        }
        if(from && from.gdrop){
          from.gdrop.dragleave.call(from, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
        }
      }else{
        to.gdrop.dragover.call(to, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      }
    }

    function ontouchend(e){
      document.removeEventListener(touchmove, ontouchmove);
      document.removeEventListener(touchend , ontouchend);
      e.preventDefault();
      if( !dragData.start ){
        clearTimeout(dragData.timeout);
        return;
      }
      var pageX = g.util.getPageX(e);
      var pageY = g.util.getPageY(e);
      var to = document.elementFromPoint(pageX, pageY);
      if( to && to.gdrop ){
        to.gdrop.drop.call(to, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
      }
      dragend.call(elem, new g.util.Event(elem, e, {dataTransfer: dragData.dataTransfer}));
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
    throw 'Unimplemented.'
  },
  addElement: function(){
    throw 'Unimplemented.'
  }
};

var touchstart = g.event.touchstart;
var touchmove  = g.event.touchmove;
var touchend   = g.event.touchend;

function noop(){};

/*
 * @desc Check if html5 draggable api supported.
 */
var draggableSupported = (function(){
  var div = document.createElement('div');
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
})();

})();