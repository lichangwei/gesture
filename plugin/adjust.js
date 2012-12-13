
(function(){
  var isAndroid = navigator.userAgent.indexOf('Android') >= 0;
  
  if( isAndroid ){
    g.opt('zoomin_min_scale', 2);
    g.opt('zoomout_max_scale', 0.5);
  }
})();