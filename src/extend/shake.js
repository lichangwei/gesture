
(function(){

if( !window.DeviceMotionEvnt ) return;

var SHAKE_THRESHOLD = 5000;
var lastTime;
var lastAcce = 0;

window.addEventListener('devicemotion', function(e){
  var a = e.accelerationIncludingGravity;
  var span = e.timeStamp - last;
  if( span < 10 ) return;
  var acce = Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z);
  
  var ratio = (acce - lastAcce) / span * 1000;
  if(ratio < SHAKE_THRESHOLD){
    g.createEvent('shake', e);
  }
  lastTime = e.timeStamp;
  lastAcce = acce;
}, false);

})();