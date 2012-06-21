(function(){

g.register('zoomin,zoomout', {
    gestureend: function(e){
        var scale = e.scale || e.data.scale;
        if(scale > 1.2){
            g.createEvent('zoomout', e)
        }else if(scale < 0.83){
            g.createEvent('zoomin', e)
        }
    }
});

})();