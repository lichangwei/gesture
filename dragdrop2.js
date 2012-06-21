(function(){

g.draggable = function(elem, dragstart, drag, dragend){
    g(elem).draggable(dragstart, drag, dragend);
    return g;
}
g.prototype.draggable = function(dragstart, drag, dragend){
    if(arguments.length === 2){
        dragend = drag;
        drag = null;
    }
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        elem.draggable = true;
        dragstart && elem.addEventListener('dragstart', dragstart, false);
        drag && elem.addEventListener('drag', drag, false);
        dragend && elem.addEventListener('dragend', dragend, false);
    }
    if(draggable) return this;
    elem.addEventListener('touchstart', function(e){
        if(!e.target.draggable) return;
        transfer = e.target;
        g.createEvent('dragstart', e);
    }, false);
    elem.addEventListener('touchmove', function(e){
        if(!e.target.draggable) return;
        g.createEvent('drag', e);
    }, false);
    elem.addEventListener('touchleave', function(e){
        
    }, false);
    elem.addEventListener('touchend', function(e){
        if(!e.target.draggable) return;
        g.createEvent('dragend', e);
    }, false);
    function doc_touchend(e){
        g.createEvent('dragend', e, {
            currentTarget: transfer
        });
        transfer = null;
    }
    document.addEventListener('touchend', doc_touchend, false);
    document.addEventListener('mouseup', doc_touchend, false);
    return this;
}
g.dropable = function(elem, dragenter, dragmove, dragleave, drop){
    g(elem).dropable(dragenter, dragmove, dragleave, drop);
    return g;
}
g.prototype.dropable = function(dragenter, dragover, dragleave, drop){
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        dragenter && elem.addEventListener('dragenter', dragenter, false);
        dragover && elem.addEventListener('dragover', dragover, false);
        dragleave && elem.addEventListener('dragleave', dragleave, false);
        drop && elem.addEventListener('drop', drop, false);
    }
    if( !draggable ){
        g.register('dropable', {
            touchstart: function(e, startT, startX, startY){
                transfer = null;
            },
            touchmove: function(e, endT, endX, endY){
                if(!transfer) return;
                if(!dragenter){
                    dragenter = true;
                    g.createEvent('dragenter', e);
                }else{
                    g.createEvent('dragover', e);
                }
            },
            touchleave: function(){
                if(!transfer) return;
                dragenter = false;
                g.createEvent('dropleave', e);
            },
            touchend: function(e){
                if(!transfer) return;
                dragenter = false;
                g.createEvent('drop', e);
            }
        });
    }
    return this;
}
var div = document.createElement('div');
var draggable = ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
var transfer;
var dragenter;

})();