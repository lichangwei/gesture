(function(){

g.register('taphold', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if( distance <= 30 && deltaT > 300 ){
            g.createEvent('taphold', e);
        }
    }
});

})();
