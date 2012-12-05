(function(){

var draggableSupported = (function(){
  var div = document.createElement('div');
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
})();

g.prototype.draggable = draggableSupported ? function(dragstart, drag, dragend){
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    elem.draggable = true;
    dragstart && elem.addEventListener('dragstart', dragstart, false);
    drag      && elem.addEventListener('drag'     , drag     , false);
    dragend   && elem.addEventListener('dragend'  , dragend  , false);
  }
  return this;
} : function(dragstart, drag, dragend){
  for(var i = 0; i < this.elems.length; i++){
    draggable(this.elems[i], dragstart, drag, dragend);
  }
  return;
};

g.prototype.dropable = function(dragenter, dragover, dragleave, drop){
  for(var i = 0; i < this.elems.length; i++){
    dropable(this.elems[i], dragenter, dragover, dragleave, drop);
  }
  return this;
};

function draggable(elem, dragstart, drag, dragend){
  elem.addEventListener(touchstart, function(e){
    e.preventDefault();
    this.drag = {};
    this.drag.timeout = setTimeout(function(){
      elem.drag.start = new Date();
      elem.drag.dataTransfer = new DataTransfer();
      dragstart.call(elem, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
    }, 300);

    function ontouchmove(e){
      e.preventDefault();
      if( !elem.drag.start ) return;
      drag.call(elem);
      var pageX = g.util.getPageX(e);
      var pageY = g.util.getPageY(e);
      var from = elem.drag.target;
      var to = document.elementFromPoint(pageX, pageY);
      if( from !== to ){
        if(to && to.gdrop){
          to.gdrop.dragenter.call(to, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
          elem.drag.target = to;
        }else{
          elem.drag.target = null;
        }
        if(from && from.gdrop){
          from.gdrop.dragleave.call(from, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
        }
      }else{
        to.gdrop.dragover.call(to, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
      }
    }
    function ontouchend(e){
      document.removeEventListener(touchmove, ontouchmove);
      document.removeEventListener(touchend, ontouchend);
      e.preventDefault();
      if( !elem.drag.start ){
        clearTimeout(elem.drag.timeout);
        return;
      }
      var pageX = g.util.getPageX(e);
      var pageY = g.util.getPageY(e);
      var to = document.elementFromPoint(pageX, pageY);
      if( to && to.gdrop ){
        to.gdrop.drop.call(to, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
      }
      dragend.call(elem, new g.util.Event(elem, e, {dataTransfer: elem.drag.dataTransfer}));
    }
    document.addEventListener(touchmove, ontouchmove, false);
    document.addEventListener(touchend, ontouchend, false);
  }, false);
}

function dropable(elem, dragenter, dragover, dragleave, drop){
  if(draggableSupported){
    dragenter && elem.addEventListener('dragenter', dragenter, false);
    dragover  && elem.addEventListener('dragover' , dragover , false);
    dragleave && elem.addEventListener('dragleave', dragleave, false);
    drop      && elem.addEventListener('drop'     , drop     , false);
    elem.ondragenter = dragenter;
  }else{
    elem.gdrop = {
      dragenter: dragenter,
      dragover : dragover,
      dragleave: dragleave,
      drop     : drop
    }
  }
}

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

  },
  addElement: function(){

  }
};

var touchstart = g.event.touchstart;
var touchmove  = g.event.touchmove;
var touchend   = g.event.touchend;

})();