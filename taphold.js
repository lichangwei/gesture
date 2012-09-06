(function(g){

'use strict';

g.register('taphold', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('taphold-max-distance') 
            || deltaT <= g.opt('tap-taphold-press-duration'))
            return;
        g.createEvent('taphold', e);
    }
});

})(g);
