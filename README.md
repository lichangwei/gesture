gesture，一个适用于移动终端和桌面浏览器的事件库，事件包括tap, doubletap, taphold, flick, zoom(zoomstart, zoom, zoomend, zoomin以及zoomout), rotate(rotatestart, ratate以及rotateend), drag & drop(dragstart, drag, dragend, dragenter, dragover, dragleave以及drop)等。  
优点：  
* 使用方便：类似jQuery的事件绑定API，支持链式调用，支持事件代理。  
* 扩展方便：根据gesture.js对原生mouse/touch事件的封装，很容易写出一个新的事件类型。  
* 调试方便：可以现代桌面浏览器上开发，然后在移动终端调试。  

首先看个例子吧，模拟[iOS界面](http://lichangwei.github.io/webapps/iospage/index.html)

# API：  
### g(elem)
创建一个gesture对象，然后可以绑定事件。  
@param elem: 需要绑定事件的DOM元素，必选。可以是字符串（selector），DOM元素，DOM元素数组，NodeList，HTMLCollection或者jQuery对象。  
@return g，拥有了on，tap，doubletap等方法的对象。  

### g.prototype.on(type[, selector][, data], callback)
绑定事件。  
@param type: 字符串，必选。需要绑定的事件类型。支持命名空间。如有多个，用空格分隔，如"tap taphold.namespace"。  
@param selector: 字符串，可选。将事件代理给某些子元素=querySelectorAll(selector)。  
@param data: 对象，可选。绑定事件时将一些数据传递给处理函数。  
@param callback: 函数，必选。事件触发时的处理函数。  
@return g对象。  

### g.prototype.off(type[, selector][, callback])
解除事件。由于type参数可以表示事件类型或（和）命名空间，解除事件的时候，需要事件类型，命名空间，选择器和处理函数需要同时相同才能解除，如果存在的话。  
@param type: 字符串，必选。需要解除的事件类型。支持命名空间。如有多个，用空格分隔，如".namespace"。  
@param selector: 字符串，可选。解除代理给selector指定的子元素上的事件。  
@param callback: 函数，可选。解除绑定在某事件上的某个函数。  
@return g对象。  

### g.prototype.trigger(type)
使用代码触发某类事件。  
@param type: 字符串，必选。需要触发的事件类型。如"tap"。  
@return g对象。  

### g.prototype.tap([selector, ][data, ]callback[, namespace])
绑定tap事件。  
@param selector: 字符串，可选。将事件代理给某些子元素=querySelectorAll(selector)。  
@param data: 对象，可选。绑定事件时将一些数据传递给处理函数。   
@param callback: 函数，必选。绑定在tap事件上的某个处理函数。  
@param namespace: 字符串，可选。命名空间。    
@return g对象。  
同样地，有doubletap，taphold，zoomin，zoomout，flick，scroll等方法。  

### g.opt(k, v)
设置或者获取时间判断的条件。  
@param k: 字符串，必选。  
@param v: 字符串，可选。为空表示获取该@k值，否则设置@k=@v。  
@return 当前系统中@param k的值。  
@k的值可以是以下之一：  
'tap_max_distance': tap事件的条件，开始和结束时手指移动距离最大为30px。  
'tap_max_duration': tap事件的条件，持续时间最大是300ms。（默认为Number.MAX_VALUE，即不管按下多长时间，都是tap。在taphold.js中将此值修改为300ms，
即小于等于300ms是tap，大于300ms是taphold。）  
'doubletap_max_interval': 双击事件中，两次单击之间的时间间隔最大为250ms。  
'flick_min_x_or_y': flick事件中，x或y方向最小移动距离是30px。  
'zoomout_max_scale': zoomout事件中，两个手指之间的距离最大是初始的0.83倍。  
'zoomin_min_scale': zoomin事件中，两个手指之间的距离最小是初始的1.2倍。  
'dragstart_after_touchstart': drag事件中，从touchstart到dragstart触发之间的时间间隔。  

### g.util.getPageX(e)
@param e: 原生事件e。  
@return pageX值。  

### g.util.getPageY(e)
@param e: 原生事件e。  
@return pageX值。  

### g.util.getDistance(p1, p2)
@param p1: [x, y]元组。  
@param p2: [x, y]元组。  
@return p1和p2两点之间的距离。  

### g.register(event, handler[, ifBind])
@param event: 字符串，必选。注册的事件类型。如有多个，用空格分隔，如"zoomin zoomout"。  
@param handler: 对象，必选。一个包含touchstart，touchmove，touchend或者gesturestart，gesturechange，gestureend等属性的对象。分别表示这些事件触发时的处理函数，用于判断是否是@event事件。  
@param ifBind: 函数，可选。绑定该事件时，执行一些设置属性等操作。  
@return g函数。  

### g.unregister(event)
@param event: 字符串，必选。需要注销的事件类型。如有多个，用空格分隔，如"zoomin zoomout"。 
@return g函数。 

### g.createEvent(name, e[, attrs]) 
@param name: 字符串，必选。需要新建的事件名称。  
@param e: 对象，必选。原生对象e，一般是touchend或者gestureend事件。  
@param attrs: 对象，可选。用于设置一些特殊属性，如flick事件中表示方向的属性direction。  
@return 无。  

### g.enableNativeEvent(type, alias)
让原生事件比如touchstart、mousedown等也可以通过型为`g().touchstart()`方式使用。
@param type: 字符串，必选。启用的原生DOM事件。  
@param alias: 字符串，字符串数组。该原生事件的同类事件，比如mousemove和touchamove是同类事件，transitionend和webkitTransitionEnd是同类事件。比如通过下例中可以同时监听transitionend和webkitTransitionEnd事件。  
@return g函数。
```js
g.enableNativeEvent('transitionend', 'webkitTransitionEnd');
gElemPages.transitionend(function(e){
  // e maybe a transitionend or webkitTransitionEnd event
});
```  

# File List
1. gesture.js  

2. tap.js
引入tap事件类型，默认地tap事件在持续时间上没有限制，手指或者鼠标移动距离应小于30px。  

3. doubletap.js  
引入doubletap事件类型，默认地两次tap之间的间隔小于250ms，则认定为是doubletap事件。但一次doubletap事件触发之前，肯定会有两次tap事件触发。  

4. tap-doubletap.js
引入tap和doubletap事件类型，也许你对tap.js和doubeltap.js的组合不够满意，不希望doubletap事件触发时，会触发两次tap事件，那么这个脚本就是为你准备的。每一个tap事件发生时，总要等待一段时间，直到250ms之后或者另一个tap事件发生，如果是前者，则触发一个tap事件，否则触发一个doubeltap事件。  

5. extend/tap-doubletap.js
引入4. tap-doubletap.js文件以后，所有的tap事件都要延时250ms（可配置），但是有时候我们希望，如果一个元素同时绑定了tap和doubletap时，tap事件才会延时。如果一个元素仅仅绑定了tap事件，那么tap事件会立即触发。   

6. taphold.js  
引入taphold事件类型，首先修改tap事件最大持续时间为300ms，此时原本的tap事件就会被区分为两种，持续时间大于300ms的，则会定义为taphold事件。  

7. flick.js  
引入flick事件类型，条件是移动距离必须大于30px。flick仅仅是事件，即手指或鼠标移动过程中不会对元素产生影响，比如，不会拖动元素。这点是和drag区分开的。flick有一个属性direction，表示向哪个方向滑动，可能取值为up，down，left和right。  

8. swipe.js  
引入了swipestart，swipe和swipeend三个事件。和flick事件类似，但是flick关注的滑动结果，而swipe关注的滑动过程。  
``` javascript
gElemPages.swipestart(function(e){
  left = parseInt(elemPages.style.left, 10) || 0;
}).swipe(function(e){
  elemPages.style.left = left + e.deltaX + 'px';
  // 可以通过e.deltaX, e.deltaY获得X和Y方向上相对初始位置的偏移量
}).swipeend(function(e){
  // 可以通过e.speedX, e.speedY获得X和Y方向上的平均速度
  // 可以通过e.deltaX, e.deltaY获得X和Y方向上相对初始位置的偏移量
});
```

9. zoomin-zoomout.js(需要多点触控支持)  
引入zoomin和zoomout事件类型，分别表示两个手指背离中点移动，向中点移动。默认地zoomin需要touch结束时两手指距离是开始时的至少1.2倍，zoomout最大是0.83倍。此事件只适用于支持multi-touch的移动设备，比如在Android2.X中是不支持的。  

10. zoom.js(需要多点触控支持)  
引入zoomstart，zoom和zoomend事件，可以通过`e.scale`来获取相对zoomstart（gesturestart）事件时的缩放比例。如果发现zoom事件触发过于频繁，可以通过`g.opt('zoom_min_step', 1.1);`来设置，只有当相对上一次zoom/zoomstart事件缩放比例达到1.1倍时才会触发zoom事件。示例/test/rotate-zoom.html  
``` js
g('#zoom').zoomstart(function(e){
  // do something
}).zoom(function(e){
  // e.scale
}).zoomend(function(e){
  // e.scale
});
```
11. rotate.js(需要多点触控支持)  
引入rotatestart，rotate和rotateend事件，可以通过`e.rotation`来获取相对rotatestart（gesturestart）事件时的旋转角度。如果发现rotate事件触发过于频繁，可以通过`g.opt('rotate_min_step', 1);`来设置，只有当相对上一次rotate/rotatestart事件旋转大于1°时才会触发rotate事件。示例/test/rotate-zoom.html 
``` javascript
g('#rotatezoom').rotatestart(function(){
}).rotate(function(e){
  // e.rotation
}).rotateend(function(e){
  // e.rotation
});
```
12. drag.js  
引入drag **行为**。示例/test/drag.html
``` javascript  
g('#item').drag({
  touchstart: function(){},
  touchmove : function(){},
  touchend  : function(){},
  container : '#container', //设置拖动范围
  helper    : 'no' //实时拖动该元素
});
```

13. dragdrop-delegatable.js  
引入dragstart, drag, dragend 和 dragenter, dragover, dragleave, drop事件。示例/test/dragdrop-delegatable.html
``` javascript
g('#container')
  .on('dragstart', '.removable', function(){})
  .on('drag',      '.removable', function(){})
  .on('dragend',   '.removable', function(){});
g('#container')
  .on('dragenter', '.recyclebin', function(){})
  .on('dragover',  '.recyclebin', function(){})
  .on('dragleave', '.recyclebin', function(){})
  .on('drop',      '.recyclebin', function(){});
```

14. dragdrop-html5.js  
引入drag和drop **行为**。对于支持HTML5 drag & drop API的浏览器，直接使用该API。对于不支持该API的浏览器，则会通过touch或者mouse事件模拟该API。有些浏览器需要调用`e.preventDefault()`，如FireFox，有些不需要，如Chrome，关于这点是需要你来做的。如果你不想关心这些，那么可以使用`g.support.draggable = false`来强制不使用HTML5 drag & drop API。示例/test/dragdrop-html5.html
``` javascript
g('.removable').draggable(ondragstart, ondrag, ondragend);
g('.recyclebin').dropable(ondragenter, ondragover, ondragleave, ondrop);
```

15. plugin/touch-alink.js
修正这样一个[issue](http://jsfiddle.net/lichangwei/hLJH3/)，在iOS和Android设备中点击某元素X，在touchend事件触发时，隐藏元素X，如果此时手指下面还有一个链接元素A，那么很可能会触发A的click事件，即便在touchend事件中调用了`e.preventDefault(); e.stopPropagation();`。解决办法是：如果A链接元素上没有触发touchend事件，而直接触发click事件，那么取消其默认行为（跳转或者打开某个页面）。

# 示例 Sample  
``` javascript  
// 支持事件代理，支持同时绑定多个事件，支持namespace，支持链式调用
// 支持的事件包括tap，doubletap，taphold，flick，zoomin和zoomout。
g('#menu').on('tap doubletap.namespace', 'li', function(e){
  e.preventDefault();
}).doubletap(function(e){
  console.info(e.type);
});
```

# 压缩脚本 Minimize gesture script  
只需要按照以下步骤即可自定义压缩gesture。  
(1) 执行命令`npm install webtools`   
(2) 打开`tools/minimize.js`，注释掉你不需要的脚本文件，并修改`initScript`内容（比如删除，如果不需要的话）  
(3) 执行命令`node minimize.js`，此步骤会生成一个新文件`gesture.min.js`  
(4) 将`gesture.min.js`引入到网站中  
  
或者使用`grunt uglify`命令。  

# Q && A  
1. Q：如何实现iOS中的效果：快速点击（tap）正常响应相应动作，按住不放（taphold）会出现拷贝，打开链接等选项卡，双击（doubletap）会放大或者缩小页面？  
A：引入（1）gesture.js.（2）tap-doubletap.js，注册了tap和doubletap事件，tap行为完成之后并不会立即触发tap事件，而是等待下一次tap行为的发生。如果tap行为发生，则触发一个doubletap事件，如果在doubletap_max_interval = 250ms内都没有发生下一次的tap行为，则触发一个tap事件.（3）引入taphold.js（4）绑定tap， doubeltap或者taphold事件即可。

# Change Log
######1.0.3 新增方法g.enbaleNativeEvent(type, alias), dragdrop-delegatable.js中的move事件使用捕获阶段。  
######1.0.2 修正on(event.namespace, selector, callback)方法中未能正确设置namespace的问题 [#2](https://github.com/lichangwei/gesture/issues/2).
######1.0.1 dragdrop-delegatable.js文件中的dragstart, drag, dragend 和 dragenter, dragover, dragleave, drop支持代理方式调用。更新文件，添加注释。
####1.0.0 (Initial Version)

