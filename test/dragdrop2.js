(function(){

g.draggable = function(elem, dragstart, drag, dragend){
  g(elem).draggable(dragstart, drag, dragend);
  return g;
};
g.prototype.draggable = function(dragstart, drag, dragend){
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    elem.draggable = true;
    dragstart && elem.addEventListener('dragstart', dragstart, false);
    drag && elem.addEventListener('drag', drag, false);
    dragend && elem.addEventListener('dragend', dragend, false);
  }
  //if(draggable) return this;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    elem.addEventListener('touchstart', function(e){
      if(!e.target.draggable) return;
      e.preventDefault();
      transfer = this;
      g.createEvent('dragstart', e);
    }, false);
    elem.addEventListener('touchmove', function(e){
      e.preventDefault();
      g.createEvent('drag', e);
    }, false);
    elem.addEventListener('touchend', function(e){
      e.preventDefault();
      g.createEvent('dragend', e);
      transfer = null;
    }, false);
  }
  return this;
};
g.dropable = function(elem, dragenter, dragmove, dragleave, drop){
  g(elem).dropable(dragenter, dragmove, dragleave, drop);
  return g;
};
g.prototype.dropable = function(dragenter, dragover, dragleave, drop){
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    dragenter && elem.addEventListener('dragenter', dragenter, false);
    dragover && elem.addEventListener('dragover', dragover, false);
    dragleave && elem.addEventListener('dragleave', dragleave, false);
    drop && elem.addEventListener('drop', drop, false);
  }
  //if(draggable) return this;
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    elem.addEventListener('touchenter', function(e){console.log(1)
      if(!transfer) return;
      e.preventDefault();
      if(!dragentered){
        dragenter = true;
        g.createEvent('dragenter', e);
      }else{
        g.createEvent('dragover', e);
      }
    }, false);
    elem.addEventListener('touchleave', function(e){
      if(!transfer) return;
      e.preventDefault();
      dragentered = false;
      g.createEvent('dropleave', e);
    }, false);
    elem.addEventListener('touchend', function(e){
      if(!transfer) return;
      e.preventDefault();
      dragentered = false;
      g.createEvent('drop', e);
    }, false);
  }
  return this;
};
var div = document.createElement('div');
var draggable = ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
var transfer;
var dragentered;

})();