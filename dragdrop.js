(function(){

g.draggable = function(elem, opt){
    g(elem).draggable(opt);
    return g;
}
g.prototype.draggable = function(opt){
    var container = opt.container || document;
    for(var i = 0; i < this.elems.length; i++){
        var elem = this.elems[i];
        elem.addEventListener('touchstart', function(e){
            
        }, false);
    }
}


var defaults = {
    dragstart: function(x, y, e){},
    drag: function(x, y, e, dx, dy, dt){},
    dragend: function(x, y, e, dx, dy){},
    css: null,
    container: document
};

})();
