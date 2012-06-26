(function(){

g.register('zoomin,zoomout', {
    gestureend: function(e){
        var scale = e.scale || e.data.scale;
        if(scale > g.opt('zoomout-min-scale')){
            g.createEvent('zoomout', e)
        }else if(scale < g.opt('zoomin-max-scale')){
            g.createEvent('zoomin', e)
        }
    }
});

})();