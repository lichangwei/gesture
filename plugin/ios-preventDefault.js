(function(){

if(!/iPhone|iPod|iPad/.test(navigator.userAgent)) return;

g(document).on('touchstart touchmove touchend', g.util.preventDefault);

})();