(function(){

g(document).on('touchstart touchmove touchend mousedown mousemove mouseup gesturestart gesturemove gestureend', function(e){
	e.preventDefault();
});

})();