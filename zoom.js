/**
 * @overview Regiester zoomin/zoomout event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('zoomin zoomout', {
    gestureend: function(e){
        var scale = e.scale;
        if(scale > g.opt('zoomin_min_scale')){
            g.createEvent('zoomin', e);
        }else if(scale < g.opt('zoomout_max_scale')){
            g.createEvent('zoomout', e);
        }
    }
});

})(g);