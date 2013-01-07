/**
 * @overview Regiester dragstart/drag/dragend/dragenter/dragleave/drop event.
 * @requires gesture.js
 */
(function(g){

g.opt('tap_max_duration', 300);

var dragData = {};

g.register('dragstart drag dragend', {
  touchstart: function(e, startT, startX, startY){
    // preventDefault is necessary for FF17 & IE10, or a html5 drag event dragstart will be fired.
    e.preventDefault();
    var gid = e.target.gid;
    var data = dragData[gid] = {};
    data.currentTarget = e.currentTarget;
    data.startX = startX;
    data.startY = startY;
    data.timeout = setTimeout(function(){
      var distance = g.util.getDistance([data.endX, data.endY], [startX, startY]);
      if(distance > g.opt('tap_max_distance')) return;
      if(data.start === false) return;
      ondragstart(e, data);
    }, g.opt('tap_max_duration'));
  },
  touchmove: function(e, endT, endX, endY){
    // @TODO what if no touchmove fired but mouseleave??
    var gid = e.target.gid;
    var data = dragData[gid];
    if(!data || data.start) return;
    data.endX = endX;
    data.endY = endY;
  },
  touchend: function(e){
    var gid = e.target.gid;
    var data = dragData[gid];
    if(!data || data.start) return;
    data.start = false;
  }
});

function ondragstart(e, data){
  var endX, endY, deltaX, deltaY;
  var target = getDraggableTarget(e, data.currentTarget);
  if(!target || !target.getAttribute('drag')) return;
  var shadow;
  var effect = target.getAttribute('drag');

  data.start = new Date();
  g.createEvent('dragstart', e, {
    targets: [target],
    eventTarget: data.currentTarget
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
    shadow.removeAttribute('drag');
    document.body.appendChild(shadow);
  }
  
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
      eventTarget: data.currentTarget
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
      eventTarget: data.currentTarget
    });
  }

  document.addEventListener(g.event.touchmove, ondrag, false);
  document.addEventListener(g.event.touchend, ondragend, false);
}

function getDraggableTarget(e, currentTarget){
  var target = e.target;
  while(target && !target.getAttribute('drag') && target !== currentTarget){
    target = target.parentNode;
  }
  return target;
}

})(g);