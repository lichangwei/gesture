(function(g){

'use strict';

g.register('tap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap-max-distance') || deltaT > g.opt('tap-max-duration'))
            return;
        g.createEvent('tap', e);
    }
});

})(g);