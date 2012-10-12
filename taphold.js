(function(g){

'use strict';

g.opt('tap-max-duration', 300);

g.register('taphold', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap-max-distance') || deltaT <= g.opt('tap-max-duration'))
            return;
        g.createEvent('taphold', e);
    }
});

})(g);
