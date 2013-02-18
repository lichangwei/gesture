/**
 * @file touch-alink.js
 * @refer http://jsfiddle.net/lichangwei/hLJH3/
 * @overview  
 */

(function(){
  
  if(g.support.touch) return;

  var tapped = {};

  g(document).on('touchend', 'a', function(){
    tapped[this._gesture_id] = true;
  }).on('click', 'a', function(e){
    if( !tapped[this._gesture_id] ){
      e.preventDefault();
    }
    tapped[this._gesture_id] = false;
  });
  
})(g);