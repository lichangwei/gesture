(function(g){

'use strict';

g.register('tap', {
    touchend: function(e, endT, endX, endY, deltaT, deltaX, deltaY, distance){
        if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
            return;
        g.createEvent('tap', e);
    }
});

})(g);