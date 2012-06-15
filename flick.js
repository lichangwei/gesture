(function(){

var threshold = 100;

g.register('flick', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        var direction;
        if( Math.abs(deltaX) >= Math.abs(deltaY) ){
            if( deltaX > threshold ){
                direction = 'right';
            }else if( deltaX < -threshold ){
                direction = 'left';
            }
        }else{
            if( deltaY > threshold ){
                direction = 'down';
            }else if( deltaY < -threshold ){
                direction = 'up';
            }
        }
        if( !direction ) return;
        g.createEvent('flick', e, {
            direction: direction
        });
    }
});

})();