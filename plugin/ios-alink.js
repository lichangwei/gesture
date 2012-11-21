
(function(){
  
  if ( !/(iPhone|iPod|iPad)/.test(navigator.userAgent) ) return;

  var tapped = {};

  g(document).on('tap', 'a', function(){
    tapped[this._gesture_id] = true;
  }).on('click', 'a', function(e){
    if( !tapped[this._gesture_id] ){
      e.preventDefault();
    }
    tapped[this._gesture_id] = false;
  });
  
})(g);