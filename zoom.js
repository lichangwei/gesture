(function(g){

'use strict';

g.register('zoomin zoomout', {
    gestureend: function(e){
        var scale = e.scale;
        if(scale > g.opt('zoomin-min-scale')){
            g.createEvent('zoomin', e);
        }else if(scale < g.opt('zoomout-max-scale')){
            g.createEvent('zoomout', e);
        }
    }
});

})(g);