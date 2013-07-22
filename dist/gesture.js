/**
 * @file gesture.js
 * @overview An event library that suitable for mobile devices or desktop browsers.
 *  encapsulates tap, doubletap, taphold, flick and zoomin/zoomout etc. Simular to the jQuery API, easy to use.
 * @version dev
 * @author Li Chang Wei <lichangwei@love.com>
 * @see https://github.com/lichangwei/gesture
 * @license The MIT License
 */
(function(){

'use strict';

/**
 * @constructor g
 * @classdesc Also can be called without 'new'
 * @param {string, array, object} elem required. String(selector), DOM element, DOM element Array, NodeList, HTMLCollection or jQuery Object
 */
var g = window.g = function(elem){
  // if call g function with out 'new'.
  if ( !(this instanceof g) ){
    return new g(elem);
  }
  var elems = this.elems = arrayify(elem);
  if(!elems || elems.length === 0 ) return;
  for(var i = 0; i < elems.length; i++){
    if(!elems[i]._gesture_id) init(elems[i]);
  }
};

g.version = '1.0';

/**
 * @method g.prototype.on
 * @desc bind events.
 * @param {string} type required. Event type, name space supported, separated by spaces if more than one, such as 'tap taphold.namespace'.
 * @param {string} selector optional. Delegate these events to its child nodes=querySelectorAll(selector)。
 * @param {object} data optional. Passing some data to callback.
 * @param {function} callback required.
 * @return {g} Current g instance.
 */
g.prototype.on = function(type, selector, data, callback){
  var _t = this;
  var namespace;
  // allow to bind 2+ events at the same time
  if(type.search(/\s/) >= 0){
    type.replace(/\S+/g, function(evt){
      _t.on(evt, selector, data, callback);
    });
    return _t;
  }
  // split event type & namespace
  if(type.indexOf('.') !== -1){
    var array = type.split('.');
    type = array[0];
    namespace = array[1];
  }
  var params = [];
  if(selector) params.push(selector);
  if(data) params.push(data);
  if(callback) params.push(callback);
  if(namespace) params.push(namespace);
  _t[type].apply(_t, params);
  return this;
};

/**
 * @method g.prototype.off
 * @desc Unbind events.
 * @param {string} type required. Event type, name space supported, separated by spaces if more than one, such as 'tap taphold.namespace'.
 * @param {string} selector optional. Unbind these events bind to child nodes.
 * @param {function} callback optional.
 * @return {g} Current g instance.
 */
g.prototype.off = function(type, selector, callback){
  var _t = this;
  var namespace;
  if(typeof selector === 'function'){ // case: off('tap', fn)
    callback = selector;
    selector = null;
  }
  // allow to remove 2+ events at the same time
  if(type.search(/\s/) >= 0){
    type.replace(/\S+/g, function(type){
      _t.off(type, selector, callback);
    });
    return _t;
  }
  // split event type & namespace
  if(type.indexOf('.') !== -1){
    var array = type.split('.');
    type = array[0];
    namespace = array[1];
  }
  for(var i = 0; i < this.elems.length; i++){
    var elem = this.elems[i];
    var cbs = callbacks[elem._gesture_id];
    if( !cbs || cbs.length === 0 ) continue;
    // remove the callbacks that match the condition
    for(var j = cbs.length - 1; j >= 0; j--){
      var cb = cbs[j];
      if(( !type      || (type      === cb.type     ) ) &&
         ( !selector  || (selector  === cb.selector ) ) && 
         ( !namespace || (namespace === cb.namespace) ) &&
         ( !callback  || (callback  === cb.original)) ){
        // remove these events bound by addEventListener too.
        var types = aliases[cb.type] || [cb.type];
        for(var k = 0; k < types.length; k++){
          elem.removeEventListener(types[k], cb.callback, false);
        }
        cbs.splice(j, 1);
        // reduce the count of listener, if reduce to 0, then won't execute its event handler
        // @see checkIfBind
        cbs._counter[cb.type]--;
      }
    }
  }
  return this;
};

/**
 * @method g.prototype.trigger
 * @desc Fire a event manually
 * @param {string} type required. Event type. such as 'tap'.
 * @return {g} Current g instance.
 */
g.prototype.trigger = function(type){
  for(var i = 0; i < this.elems.length; i++){
    createCustomEvent(type, null, {
      eventTarget: this.elems[i],
      canBubble: true
    });
  }
  return this;
};

/**
 * @method g.register
 * @desc Regiester an event type. used to extend this framework.
 * @param {string} type required. The event type to regiester.
 * @param {object} handler optional. A object may contains 3 methods named 'touchstart', 'toucmove', 'touchend'
 * @param {function} ifBind optional. This function will be executed when bind this event to an element.
 * @return g class
 */
g.register = function(type, handler, ifBind){
  if(events[type]){
    console.error('"' + type + '" cannot be regiested twice.');
  }else{
    handler = handler || {};
    events[type] = handler;
    var types = handler.types = type.split(/\s/);
    for(var i = 0; i < types.length; i++){
      register(types[i], ifBind);
    }
  }
  return this;
};
/**
 * @method g.unregister
 * @desc Unregiester an event type. this function will not be used normally.
 * @param {string} type event type, such as 'tap'.
 * @return g class
 */
g.unregister = function(type){
  delete events[type];
  type = type.split(/\s/);
  for(var i = 0; i < type.length; i++){
    delete g.prototype[type[i]];
  }
  return this;
};

/*
 * @method g.enableNativeEvents
 * @desc allow using native events just like tap etc.
 * @param {string...} types required.
 * @return g class
 * @sample g.enableNativeEvents('touchstart mousedown', 'click');
 *   After above code was executed, you can listen touchstart and mousedown event by using code `g().touchstart()`,
 *   and listen click event by using code 'g().click()'
 */
g.enableNativeEvents = function(){
  for(var i = 0; i < arguments.length; i++){
    var types = arguments[i].split(/\s+/);
    aliases[types[0]] = types;
    register(types[0]);
  }
  return this;
};

/**
 * @method g.opt
 * @desc set or get some config data
 * @param {string, object} k a string key or an object contains key-value pairs.
 * @param {any} v.
 * @return If k is an object, then return undefined, otherwise the value of g.opt(k)
 */
g.opt = function(k, v){
  if(typeof k !== 'string'){
    for(var i in k){
      opt[i] = k[i];
    }
    return;
  }
  return v === void 0 ? opt[k] : (opt[k]=v);
};

/**
 * @method g.createEvent
 * @desc fire an event(logicly)
 * @param {string} type required. Event type.
 * @param {event} e optional. The relatived original event. touchend or mouseup normally.
 * @param {object} attrs optional. Some additional attribute. such as 'currentTarget', 'targets', 'direction'(flick)
 * @return A customize Event.
 */
g.createEvent = function(type, e, attrs){
  attrs = attrs || {};
  e = e || {};
  var evt = new Event(type, e, attrs);
  var target = evt.currentTarget;
  var gid = target._gesture_id || '';
  var cbs = callbacks[gid] || [];
  for(var i = 0; i < cbs.length && !evt.isImmediatePropagationStopped(); i++){
    var cb = cbs[i];
    if( cb.type === type ){
      evt.data = cb.data;
      cb.callback.call( target, evt );
    }
  }
  return evt;
};

function register(type, ifBind){
  g.prototype[type] = function(selector, data, callback, namespace){
    if(typeof selector !== 'string'){
      namespace = callback;
      callback = data;
      data = selector;
      selector = void 0;
    }
    if(typeof data !== 'object'){
      namespace = callback;
      callback = data;
      data = void 0;
    }
    var cb = selector ? createDelegateCallback(type, selector, callback) : callback;
    for(var i = 0; i < this.elems.length; i++){
      var elem = this.elems[i];
      ifBind && ifBind.call(elem, type);
      // bind it as a native event
      var types = aliases[type] || [type];
      for(var j = 0; types && j < types.length; j++){
        elem.addEventListener(types[j], cb, false);
      }
      var cbs = callbacks[elem._gesture_id];
      cbs.push({
        type: type,
        selector: selector,
        namespace: namespace,
        callback: cb,
        original: callback,
        data: data
      });
      cbs._counter[type] = (cbs._counter[type] || 0) + 1;
    }
    return this;
  };
}

var events = {};
var aliases = {};
var callbacks = {};
var gesture_id = 0;

/**
 * @inner opt
 */
var opt = {
  'tap_max_distance': 30,
  'tap_max_duration': Number.MAX_VALUE,
  
  'doubletap_max_interval': 250,
  
  'flick_min_x_or_y': 30,

  'dragstart_after_touchstart': 300,
  
  'zoomout_max_scale': 0.83,
  'zoomin_min_scale': 1.2
};


function init(elem){
  elem._gesture_id = ++gesture_id;

  var cbs = callbacks[elem._gesture_id] = [];
  var counter = cbs._counter = {};

  var status = 0;
  var startT, startX, startY;
  var endT, endX, endY;
  var deltaT, deltaX, deltaY;
  var distance;
  var data = {
    targets: []
  };
  
  elem.addEventListener(touchstart, function(e){
    status = 1;
    endT = startT = e.timeStamp;
    endX = startX = getPageX(e);
    endY = startY = getPageY(e);

    for(var k in events){
      var ek = events[k];
      if(typeof ek.touchstart !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.touchstart.call(this, e, data, startT, startX, startY);
      if(result === false) break;
    }
  }, false);
  elem.addEventListener(touchmove, function(e){
    if(!status) return;
    endT = e.timeStamp;
    endX = getPageX(e);
    endY = getPageY(e);
    deltaT = endT - startT;
    deltaX = endX - startX;
    deltaY = endY - startY;
    for(var k in events){
      var ek = events[k];
      if(typeof ek.touchmove !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.touchmove.call(this, e, data, endT, endX, endY, deltaT, deltaX, deltaY);
      if(result === false) break;
    }
  }, false);
  elem.addEventListener(touchend, function(e){
    if(!status) return;
    endT = e.timeStamp;
    deltaT = endT - startT;
    deltaX = endX - startX;
    deltaY = endY - startY;
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    for(var k in events){
      var ek = events[k];
      if(typeof ek.touchend !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.touchend.call(this, e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance);
      if(result === false) break;
    }
    status = 0;
  }, false);
  elem.addEventListener(touchleave, function(e){
    status = 0;
  }, false);
  elem.addEventListener('touchcancel', function(e){
    status = 0;
  }, false);
  
  elem.addEventListener(gesturestart, function(e){
    status = 0;
    for(var k in events){
      var ek = events[k];
      if(typeof ek.gesturestart !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.gesturestart.call(this, e, data);
      if(result === false) break;
    }
  }, false);
  elem.addEventListener(gesturechange, function(e){
    status = 0;
    for(var k in events){
      var ek = events[k];
      if(typeof ek.gesturechange !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.gesturechange.call(this, e, data);
      if(result === false) break;
    }
  }, false);
  elem.addEventListener(gestureend, function(e){
    status = 0;
    for(var k in events){
      var ek = events[k];
      if(typeof ek.gestureend !== 'function') continue;
      if( !checkIfBind(ek.types, counter) ) continue;
      var result = ek.gestureend.call(this, e, data);
      if(result === false) break;
    }
  }, false);
  if(is_touch_supported && !is_gesture_supported){
    (function(){
      var start, end, rotation;
      elem.addEventListener(touchstart, function(e){
        if(e.touches.length < 2) return;
        start = getInfo(e);
        rotation = 0;
        createCustomEvent(gesturestart, e, {
          scale: 1,
          rotation: rotation
        });
      }, false);
      elem.addEventListener(touchmove, function(e){
        if(e.touches.length < 2) return;
        if(!start) return;
        end = getInfo(e);
        var _rotation = end.angle - start.angle;
        rotation = _rotation;
        createCustomEvent(gesturechange, e, {
          scale: end.distance/start.distance,
          rotation: _rotation
        });
      }, false);
      elem.addEventListener(touchend, function(e){
        if(e.touches.length > 0) return;
        if(!start) return;
        createCustomEvent(gestureend, e, {
          scale: end.distance/start.distance,
          rotation: rotation
        });
        start = end = 0;
      }, false);
    })();
  }
}

function checkIfBind(types, counter){
  for(var i = 0; i < types.length; i++){
    if( counter[types[i]] > 0 ){
      return true;
    }
  }
  return false;
}

var is_customer_event_supported = !!window.CustomEvent;
var is_touch_supported          = 'ontouchstart' in document.documentElement;
var is_gesture_supported        = 'ongesturestart' in document.documentElement;

var touchstart = is_touch_supported ? 'touchstart' : 'mousedown';
var touchmove  = is_touch_supported ? 'touchmove'  : 'mousemove';
var touchend   = is_touch_supported ? 'touchend'   : 'mouseup';
var touchleave = is_touch_supported ? 'touchleave' : 'mouseleave';

var gesturestart  = 'gesturestart';
var gesturechange = 'gesturechange';
var gestureend    = 'gestureend';

/**
 * @member g.event
 * @property {string} g.event.touchstart 'touchstart' or 'mousedown'.<br/>
 * @property {string} g.event.touchmove 'toucmove' or 'mousemove'.<br/>
 * @property {string} g.event.touchend 'touchend' or 'mouseup'.
 */
g.event = {
  touchstart: touchstart,
  touchmove : touchmove,
  touchend  : touchend
};
/**
 * @member g.support
 * @property {boolean} g.support.touch If touch event supported.<br/>
 * @property {boolean} g.support.gesture If gesture event supported.
 */
g.support = {
  touch  : is_touch_supported,
  gesture: is_gesture_supported
};
/**
 * @member g.util
 * @property {function}  g.util.getPageX @see .util.getPageX
 * @property {function}  g.util.getPageY @see .util.getPageY
 * @property {function}  g.util.getDistance @see .util.getDistance
 * @property {function}  g.util.extend @see .util.extend
 */
g.util = {
  arrayify   : arrayify,
  getPageX   : getPageX,
  getPageY   : getPageY,
  getDistance: getDistance,
  extend     : extend,
  Event      : Event
};

/**
 * @function To convert the element(s) specified by the parameter 'elem' into an array.
 * @param {jQuery, HTMLElement, String, NodeList, HTMLCollection, Array}
 * @return {Array} an array contains some dom node element(HTMLElement).
 * @memberof! g
 */
function arrayify( elem ){
  if(typeof jQuery !== 'undefined' && elem instanceof jQuery){
    // don't use elem.jquery any more.
    elem = elem.get();
  }else if(elem instanceof HTMLElement || elem === document){
    // document is instance of HTMLDocument(but Document in IE)
    elem = [elem];
  }else if(typeof elem === 'string'){
    elem = document.querySelectorAll(elem);
  }
  // Here we recommend to use below methods to get an element collection.
  // getElementsByClassName
  // getElementsByTagName
  // getElementsByName
  // querySelectorAll
  // children attribute
  
  // and we don't handle these collections:
  // HTMLOptionsCollection, HTMLSelectElement
  // HTMLFormElement, HTMLAllCollection
  if(elem instanceof NodeList || elem instanceof HTMLCollection){
    var array = [];
    for(var i = 0; i < elem.length; i++){
      array.push(elem[i]);
    }
    elem = array;
  }
  return elem;
}

/**
 * @function g.util.getPageX
 * @param {event} e touch or mouse event.
 * @return {number} pageX or clientX attribute
 * @memberof! g
 */
function getPageX(e){
  return e.pageX || e.clientX ||
    (e.touches && e.touches[0] ? e.touches[0].pageX : 0) ||
    (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].pageX : 0);
}

/**
 * @function g.util.getPageY
 * @param {event} e touch or mouse event.
 * @return {number} pageY or clientY attribute
 * @memberof! g
 */
function getPageY(e){
  return e.pageY || e.clientY ||
    (e.touches && e.touches[0] ? e.touches[0].pageY : 0) ||
    (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].pageY : 0);
}

function getInfo(e){
  var t0 = e.touches[0];
  var t1 = e.touches[1];
  var p0 = [t0.pageX, t0.pageY];
  var p1 = [t1.pageX, t1.pageY];
  return {
    distance: getDistance(p0, p1),
    angle: getAngle(p0, p1)
  };
}

function getAngle(p0, p1){
  var deltaX = p0[0]-p1[0];
  var deltaY = p0[1]-p1[1];
  if(deltaX === 0){
    return deltaY === 0 ? 0 : (deltaY > 0 ? 90 : -90);
  }
  return Math.atan(deltaY / deltaX) * 180 / Math.PI;
}

/**
 * @function g.util.getDistance
 * @desc calculate the distance between 2 points
 * @param {array} p0 format: [x0, y0]
 * @param {array} p1 format: [x1, y1]
 * @return {number} the distance
 * @memberof! g
 */
function getDistance(p0, p1){
  return Math.sqrt( Math.pow(p1[0]-p0[0], 2) + Math.pow(p1[1]-p0[1], 2) );
}

/**
 * @function g.util.extend
 * @desc copy @param from attributes to @param to.
 * @param {object} to required
 * @param {object} from required
 * @memberof! g
 */
function extend(to, from){
  for(var k in from){
    if( from.hasOwnProperty(k) ){
      to[k] = from[k];
    }
  }
}

function createDelegateCallback( type, selector, callback ){
  var cbs = callback._g_cbs = callback._g_cbs || {};
  var id = getDelegateCallbackId(type, selector);
  if( !cbs[id] ){
    cbs[id] = function(e){
      var _list = this.querySelectorAll(selector);
      if( _list.length === 0 ) return;
      var list = [];
      for(var i = 0; i < _list.length; i++){
        list.push(_list[i]);
      }
      var target;
      var targets = e.targets ||
        (e.target && [e.target]) ||
        (e.eventTarget && [e.eventTarget]);
      for(var i = 0; targets && i < targets.length; i++){
        for(var o = targets[i]; o !== this; o = o.parentNode){
          if( !o ) return;
          if(list.indexOf(o) >= 0) break;
        }
        if(o === this) return;
        if(target && (target !== o)) return;
        target = o;
      }
      if(e.isSimulated){
        e.target = target;
      }
      target && callback.call(target, e);
    };
  }
  return cbs[id];
}

function getDelegateCallback(type, selector, callback){
  var id = getDelegateCallbackId(type, selector);
  return callback._g_cbs && callback._g_cbs[id];
}

function getDelegateCallbackId(type, selector){
  return type + '-' + selector;
}

/**
 * @constructor Event
 * @classdesc Simulate same custom events. such as tap etc.
 * @param {string} type required. Event type.
 * @param {Event} e optinal. original event, Usually it is the touchend/mouseup event.
 * @param {Object} attrs optional. Add some additional attributes for this event.
 */
function Event(type, e, attrs){
  extend( this, attrs );
  this.type = type;
  this.originalEvent = e;
  this.target = e.target || e.currentTarget || document;
  this.currentTarget = attrs.eventTarget || e.currentTarget || document;
  this.pageX = getPageX(e);
  this.pageY = getPageY(e);
}
Event.prototype = {
  preventDefault: function(){
    this.defaultPrevented = true;
    var e = this.originalEvent;
    e && e.preventDefault();
  },
  stopPropagation: function(){
    var e = this.originalEvent;
    e && e.stopPropagation();
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  },
  isImmediatePropagationStopped: returnFalse,
  isSimulated: true,
  defaultPrevented: false
};

function createCustomEvent(type, e, attrs){
  attrs = attrs || {};
  e = e || {};
  // some browsers don't support CustomEvent
  var evt;
  if(is_customer_event_supported){
    evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(type, attrs.canBubble, true, 1);
  }else{
    evt = document.createEvent('UIEvent');
    evt.initUIEvent(type, attrs.canBubble, true, document.defaultView, 1);
  }
  extend(evt, attrs);
  evt.originalEvent = e;
  evt.isSimulated = true;
  evt.px = getPageX(e);
  evt.py = getPageY(e);
  var target = attrs.eventTarget || e.currentTarget;
  (target || document).dispatchEvent(evt);
}

function returnTrue(){
  return true;
}

function returnFalse(){
  return false;
}

// allow user bind some standard events.
g.enableNativeEvents('touchstart mousedown', 'touchmove mousemove', 'touchend mouseup', 'click');

})();

/**
 * @overview Regiester tap & doubletap event. 
 *  Cannot be used with tap.js or doubletap.js. <br/>
 *  After a tap event occured, it won't be fired. if another tap occured in 250ms, 
 *  then a doubletap event fired, otherwise a tap event fired.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('tap doubletap', {
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(distance > g.opt('tap_max_distance') || deltaT > g.opt('tap_max_duration'))
      return;
    handler(this, e, data);
  }
});

function handler(elem, e, data){
  var targets = data.targets;
  targets.push(e.target);

  if(targets.length >= 2){
    clearTimeout(data.timerTapDoubletap);
    g.createEvent('doubletap', e, {
      targets: data.targets
    });
    targets.length = 0;
  }else if(targets.length === 1){
    (function(e, data){
      var currentTarget = e.currentTarget;
      data.timerTapDoubletap = setTimeout(function(){
        g.createEvent('tap', e, {
          eventTarget: currentTarget,
          targets: data.targets
        });
        data.targets.length = 0;
      }, g.opt('doubletap_max_interval'));
    })(e, data);
  }
}

})(g);
/**
 * @overview Regiester taphold event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.opt('tap_max_duration', 300);

g.register('taphold', {
  touchstart: function(e, data){
    var currentTarget = e.currentTarget;
    data.timerTaphold = setTimeout(function(){
      g.createEvent('taphold', e, {
        eventTarget: currentTarget
      });
    }, g.opt('tap_max_duration'));
  },
  touchmove: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(distance > g.opt('tap_max_distance')){
      clearTimeout(data.timerTaphold);
    }
  },
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    clearTimeout(data.timerTaphold);
  }
});

})(g);

/**
 * @overview Regiester swipestart swipe swipeend event.
 * @requires gesture.js
 */
(function(g){

'use strict';

g.register('swipestart swipe swipeend', {
  touchstart: function(e, data, x, y){
    e.preventDefault();
  },
  touchmove: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY){
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if(!data.isSwipe && distance >= g.opt('tap_max_distance')){
      data.isSwipe = true;
      g.createEvent('swipestart', e);
    }
    if(data.isSwipe){
      g.createEvent('swipe', e, {
        deltaX: deltaX,
        deltaY: deltaY
      });
    }
  },
  touchend: function(e, data, endT, endX, endY, deltaT, deltaX, deltaY, distance){
    if(!data.isSwipe) return;
    var speedX = deltaX / deltaT * 1000;
    var speedY = deltaY / deltaT * 1000;
    g.createEvent('swipeend', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      speedX: speedX,
      speedY: speedY
    });
    data.isSwipe = false;
  }
});

})(g);
/**
 * @overview Regiester dragstart/drag/dragend/dragenter/dragover/dragleave/drop event.
 * @requires gesture.js
 */
(function(g){

g.register('dragstart drag dragend', {
  touchstart: function(e, data, startT, startX, startY){
    // preventDefault is necessary for FF17 & IE10, or a html5 drag event dragstart will be fired.
    e.preventDefault();
    var dragData = data.dragData = {};
    dragData.currentTarget = e.currentTarget;
    dragData.startX = startX;
    dragData.startY = startY;
    clearTimeout(dragData.timeout);
    dragData.timeout = setTimeout(function(){
      // if it moved more than XX px
      var distance = g.util.getDistance([dragData.endX, dragData.endY], [startX, startY]);
      if(distance > g.opt('tap_max_distance')) return;
      ondragstart(e, dragData);
    }, g.opt('dragstart_after_touchstart'));
  },
  touchmove: function(e, data, endT, endX, endY){
    // @TODO what if no mousemove fired but mouseleave??
    var dragData = data.dragData;
    if(!dragData || dragData.start) return;
    dragData.endX = endX;
    dragData.endY = endY;
  },
  touchend: function(e, data){
    var dragData = data.dragData;
    // Maybe drag events were bound after touchstart and before touchend,
    // so dragData meybe null or undefined.
    if(dragData){
      clearTimeout(data.dragData.timeout);
      data.dragData = null;
    }
  }
});

g.register('dragenter dragover dragleave drop', {}, function(event){
  this._g_dropable_ancestor = true;
});

function ondragstart(e, data){
  var endX, endY, deltaX, deltaY;
  var target = getDraggableElement(e, data.currentTarget);
  if(!target || !target.getAttribute('drag')) return;
  var shadow;
  var effect = target.getAttribute('drag');
  var dataTransfer = new DataTransfer();

  data.start = new Date();
  g.createEvent('dragstart', e, {
    targets: [target],
    eventTarget: data.currentTarget,
    dataTransfer: dataTransfer
  });

  var style = window.getComputedStyle(target, null);
  var isAbsolute = style.position === 'absolute';
  var startElemX = isAbsolute ? target.offsetLeft : (parseInt(style.left, 10) || 0);
  var startElemY = isAbsolute ? target.offsetTop :  (parseInt(style.top , 10) || 0);

  var absoluteElemX;
  var absoluteElemY;
  var rect = target.getBoundingClientRect();

  var container = target.getAttribute('container');
  if(container) container = document.querySelector(container);
  if(container) container = container.getBoundingClientRect();

  var top, left;
  if(effect === 'copy'){
    shadow = target.cloneNode(true);
    shadow.className      = target.className;
    shadow.style.cssText  = target.style.cssText;
    shadow.style.position = 'absolute';
    shadow.style.top      = rect.top + 'px';
    shadow.style.left     = rect.left + 'px';
    shadow.style.opacity  = '0.5';
    shadow.style.pointerEvents = 'none';
    shadow.removeAttribute('drag');
    document.body.appendChild(shadow);
  }

  var from = {}, to = {};
  
  function ondrag(e){
    e.preventDefault();
    e.stopPropagation();
    endX = g.util.getPageX(e);
    endY = g.util.getPageY(e);
    deltaX = endX - data.startX;
    deltaY = endY - data.startY;
    absoluteElemX = deltaX + rect.left;
    absoluteElemY = deltaY + rect.top;
    if(container){
      absoluteElemX = Math.min(absoluteElemX, container.right - rect.width);
      absoluteElemX = Math.max(absoluteElemX, container.left);
      absoluteElemY = Math.min(absoluteElemY, container.bottom - rect.height);
      absoluteElemY = Math.max(absoluteElemY, container.top);
      deltaX = absoluteElemX - rect.left;
      deltaY = absoluteElemY - rect.top;
    }

    (shadow || target).style.top = '-10000px';
    to = getDropableElement( document.elementFromPoint(endX, endY) );
    if(from.dropable === to.dropable){
      trigger('dragover', e, {dataTransfer: dataTransfer}, to);
    }else{
      if(from.dropable){
        trigger('dragleave', e, {dataTransfer: dataTransfer}, from);
      }
      if(to.dropable){
        trigger('dragenter', e, {dataTransfer: dataTransfer}, to);
      }
      from = to;
    }

    if(effect === 'copy'){
      shadow.style.top = rect.top + deltaY + 'px';
      shadow.style.left = rect.left + deltaX + 'px';
    }else{
      target.style.top = startElemY + deltaY + 'px';
      target.style.left = startElemX + deltaX + 'px';
    }
    g.createEvent('drag', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      targets: [target],
      eventTarget: data.currentTarget,
      dataTransfer: dataTransfer
    });
  }

  function ondragend(e){
    e.preventDefault();
    document.removeEventListener(g.event.touchmove, ondrag, true);
    document.removeEventListener(g.event.touchend, ondragend, false);
    if(effect === 'copy'){
      document.body.removeChild(shadow);
    }
    var dropE = trigger('drop', e, {dataTransfer: dataTransfer}, to);
    var dragE = g.createEvent('dragend', e, {
      deltaX: deltaX,
      deltaY: deltaY,
      targets: [target],
      eventTarget: data.currentTarget,
      dataTransfer: dataTransfer
    });
    var defaultPrevented = dropE ? dropE.defaultPrevented : true;
    // the default action is moving the draged element to somehwere.
    // if the default action is prevented, then it should noe be moved.
    if(defaultPrevented){
      // if it has been moved, then reset it's position.
      if(effect === 'move'){
        target.style.top = startElemY + 'px';
        target.style.left = startElemX + 'px';
      }
    }else{
      // if the default action is not prevented, and it has not been moved
      if(effect === 'copy'){
        target.style.top = startElemY + deltaY + 'px';
        target.style.left = startElemX + deltaX + 'px';
      }
    }
  }

  document.addEventListener(g.event.touchmove, ondrag, true);
  document.addEventListener(g.event.touchend, ondragend, false);
}

function getDraggableElement(e, currentTarget){
  var target = e.target;
  while(target && !target.getAttribute('drag') && target !== currentTarget){
    target = target.parentNode;
  }
  return target;
}

function getDropableElement(target){
  var dropable, ancestor;
  while(target){
    if(!dropable && target.getAttribute && target.getAttribute('dropable')){
      dropable = target;
    }
    if(!ancestor && target._g_dropable_ancestor){
      ancestor = target;
    }
    target = target.parentNode;
  }
  return {dropable: dropable, ancestor: ancestor};
}

function trigger(type, originalEvent, attrs, dropableElement){
  if(dropableElement.dropable){
    attrs = attrs || {};
    attrs.targets = [dropableElement.dropable];
    attrs.eventTarget = dropableElement.ancestor || dropableElement.dropable;
    return g.createEvent(type, originalEvent, attrs);
  }
}

/*
 * @constructor DataTransfer
 * @desc Simulate the e.dataTransfer in the HTML5 drag & drop event.
 */
function DataTransfer(){
  this.data = {};
}
DataTransfer.prototype = {
  // copy: A copy of the source item is made at the new location.
  // move: An item is moved to a new location.
  // link: A link is established to the source at the new location.
  // none: The item may not be dropped.
  dropEffect: 'none', //'copy',
  // copy: A copy of the source item may be made at the new location.
  // move: An item may be moved to a new location.
  // link: A link may be established to the source at the new location.
  // copyLink: A copy or link operation is permitted.
  // copyMove: A copy or move operation is permitted.
  // linkMove: A link or move operation is permitted.
  // all: All operations are permitted.
  // none: the item may not be dropped.
  // uninitialized: the default value when the effect has not been set, equivalent to all.
  effectAllowed: '',
  setData: function(key, value){
    this.data[key] = value;
  },
  getData: function(key){
    return this.data[key];
  },
  clearData: function(){
    this.data = {};
  },
  setDragImage: function(img, x, y){
    throw 'Unimplemented.';
  },
  addElement: function(){
    throw 'Unimplemented.';
  }
};

})(g);