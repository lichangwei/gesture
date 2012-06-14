
(function(){

HTMLElement.prototype.gesture = function(event, fn){
    if(!this._gesture_inited) init(this);
    listen(this, event, fn);
}
var old = window.g;
var events = {};
var g = window.g = {
    register: function(event, handler){
        if(handlers[event]) return alert('');
        handlers[event] = handler;
    },
}

function init(elem){
    elem.addEventListner('touchstart', function(e){
        for(var k in events){
            if(typeof events[k].touchstart !== 'function') continue;
            var result = events[k].touchstart(e);
            if(!result) break;
        }
        function touchmove(e){
            for(var k in events){
                if(typeof events[k].touchmove !== 'function') continue;
                var result = events[k].touchmove(e);
                if(!result) break;
            }
        }
        function touchend(e){
            for(var k in events){
                if(typeof events[k].touchend !== 'function') continue;
                var result = events[k].touchend(e);
                if(!result) break;
            }
            elem.removeEventListner('touchmove', touchmove);
            elem.removeEventListner('touchend', touchend);
            elem.removeEventListner('touchleave', touchleave);
        }
        function touchleave(e){
            
            elem.removeEventListner('touchmove', touchmove);
            elem.removeEventListner('touchend', touchend);
            elem.removeEventListner('touchleave', touchleave);
        }
        elem.addEventListner('touchmove', touchmove, false);
        elem.addEventListner('touchend', touchend, false);
        elem.addEventListner('touchleave', touchleave, false);
    });
}

g.register('tap', {
    touchstart: function(e){
        
    },
    touchmove: function(e){
        
    },
    touchend: function(e){
        
    }
});

})();
