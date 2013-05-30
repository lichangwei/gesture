/**
 * @overview Regiester dragstart/drag/dragend/dragenter/dragover/dragleave/drop event.
 * @requires gesture.js
 */
(function(g){

g.register('dragstart drag dragend', {
  touchstart: function(e, data, startT, startX, startY){
    // preventDefault is necessary for FF17 & IE10, or a html5 drag event dragstart will be fired.
    e.preventDefault();
    var dragData = data.dragData = {};
    dragData.currentTarget = e.currentTarget;
    dragData.startX = startX;
    dragData.startY = startY;
    clearTimeout(dragData.timeout);
    dragData.timeout = setTimeout(function(){
      // if it moved more than XX px
      var distance = g.util.getDistance([dragData.endX, dragData.endY], [startX, startY]);
      if(distance > g.opt('tap_max_distance')) return;
      ondragstart(e, dragData);
    }, g.opt('dragstart_after_touchstart'));
  },
  touchmove: function(e, data, endT, endX, endY){
    // @TODO what if no mousemove fired but mouseleave??
    var dragData = data.dragData;
    if(!dragData || dragData.start) return;
    dragData.endX = endX;
    dragData.endY = endY;
  },
  touchend: function(e, data){
    var dragData = data.dragData;
    // Maybe drag events were bound after touchstart and before touchend,
    // so dragData meybe null or undefined.
    if(dragData){
      clearTimeout(data.dragData.timeout);
      data.dragData = null;
    }
  }
});

g.register('dragenter dragover dragleave drop', {}, function(event){
  this._g_dropable_ancestor = true;
});

function ondragstart(e, data){
  var endX, endY, deltaX, deltaY;
  var target = getDraggableElement(e, data.currentTarget);
  if(!target || !target.getAttribute('drag')) return;
  var shadow;
  var effect = target.getAttribute('drag');
  var dataTransfer = new DataTransfer();

  data.start = new Date();
  g.createEvent('dragstart', e, {
    targets: [target],
    eventTarget: data.currentTarget,
    dataTransfer: dataTransfer
  });

  var style = window.getComputedStyle(target, null);
  var isAbsolute = style.position === 'absolute';
  var startElemX = isAbsolute ? target.offsetLeft : (parseInt(style.left, 10) || 0);
  var startElemY = isAbsolute ? target.offsetTop :  (parseInt(style.top , 10) || 0);

  var absoluteElemX;
  var absoluteElemY;
  var rect = target.getBoundingClientRect();

  var container = target.getAttribute('container');
  if(container) container = document.querySelector(container);
  if(container) container = container.getBoundingClientRect();

  var top, left;
  if(effect === 'copy'){
    shadow = target.cloneNode(true);
    shadow.className      = target.className;
    shadow.style.cssText  = target.style.cssText;
    shadow.style.position = 'absolute';
    shadow.style.top      = rect.top + 'px';
    shadow.style.left     = rect.left + 'px';
    shadow.style.opacity  = '0.5';
    shadow.style.pointerEvents = 'none';
    shadow.removeAttribute('drag');
    document.body.appendChild(shadow);
  }

  var from = {}, to = {};
  
  function ondrag(e){
    e.preventDefault();
    endX = g.util.getPageX(e);
    endY = g.util.getPageY(e);
    deltaX = endX - data.startX;
    deltaY = endY - data.startY;
    absoluteElemX = deltaX + rect.left;
    absoluteElemY = deltaY + rect.top;
    if(container){
      absoluteElemX = Math.min(absoluteElemX, container.right - rect.width);
      absoluteElemX = Math.max(absoluteElemX, container.left);
      absoluteElemY = Math.min(absoluteElemY, container.bottom - rect.height);
      absoluteElemY = Math.max(absoluteElemY, container.top);
      deltaX = absoluteElemX - rect.left;
      deltaY = absoluteElemY - rect.top;
    }

    (shadow || target).style.top = '-10000px';
    to = getDropableElement( document.elementFromPoint(endX, endY) );
    if(from.dropable === to.dropable){
      trigger('dragover', e, {dataTransfer: dataTransfer}, to);
    }else{
      if(from.dropable){
        trigger('dragleave', e, {dataTransfer: dataTransfer}, from);
      }
      if(to.dropable){
        trigger('dragenter', e, {dataTransfer: dataTransfer}, to);
      }
      from = to;
    }

    if(effect === 'copy'){
      shadow.style.top = rect.top + deltaY + 'px';
      shadow.style.left = rect.left + deltaX + 'px';
    }else{
      target.style.top = startElemY + deltaY + 'px';
      target.style.left = startElemX + deltaX + 'px';
    }
    g.createEvent('drag', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      targets: [target],
      eventTarget: data.currentTarget,
      dataTransfer: dataTransfer
    });
  }

  function ondragend(e){
    document.removeEventListener(g.event.touchmove, ondrag);
    document.removeEventListener(g.event.touchend, ondragend);
    e.preventDefault();
    if(effect === 'copy'){
      document.body.removeChild(shadow);
      target.style.top = startElemY + deltaY + 'px';
      target.style.left = startElemX + deltaX + 'px';
    }
    g.createEvent('dragend', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      targets: [target],
      eventTarget: data.currentTarget,
      dataTransfer: dataTransfer
    });
    trigger('drop', e, {dataTransfer: dataTransfer}, to);
  }

  document.addEventListener(g.event.touchmove, ondrag, false);
  document.addEventListener(g.event.touchend, ondragend, false);
}

function getDraggableElement(e, currentTarget){
  var target = e.target;
  while(target && !target.getAttribute('drag') && target !== currentTarget){
    target = target.parentNode;
  }
  return target;
}

function getDropableElement(target){
  var dropable, ancestor;
  while(target){
    if(!dropable && target.getAttribute && target.getAttribute('dropable')){
      dropable = target;
    }
    if(!ancestor && target._g_dropable_ancestor){
      ancestor = target;
    }
    target = target.parentNode;
  }
  return {dropable: dropable, ancestor: ancestor};
}

function trigger(type, originalEvent, attrs, dropableElement){
  attrs = attrs || {};
  attrs.targets = [dropableElement.dropable];
  if(dropableElement.dropable && dropableElement.ancestor){
    attrs.eventTarget = dropableElement.ancestor;
    g.createEvent(type, originalEvent, attrs);
  }
  if(dropableElement.dropable && !dropableElement.ancestor){
    attrs.eventTarget = dropableElement.dropable;
    g.createEvent(type, originalEvent, attrs);
  }
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

})(g);