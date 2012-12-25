gesture，一个适用于移动终端和桌面浏览器的事件库，事件包括tap，doubletap，taphold，flick，zoomin和zoomout，动作包括dragdrop和scroll。  
优点：  
* 类似jQuery的API，使用方便。  
* 可以现在桌面浏览器上开发，然后在移动终端调试。  

# API：  
**g( elem )**  
创建一个gesture对象，然后可以绑定事件。  
@param elem: 需要绑定事件的DOM元素，必选。可以是字符串（selector），DOM元素，DOM元素数组，NodeList，HTMLCollection或者jQuery对象。   
@return g，拥有了on，tap，doubletap等方法的对象。  

**g.prototype.on(type[, selector][, data], callback)**  
绑定事件。  
@param type: 字符串，必选。需要绑定的事件类型。支持命名空间。如有多个，用空格分隔，如"tap taphold.namespace"。  
@param selector: 字符串，可选。将事件代理给某些子元素=querySelectorAll(selector)。  
@param data: 对象，可选。绑定事件时将一些数据传递给处理函数。  
@param callback: 函数，必选。事件触发时的处理函数。  
@return g对象。  

**g.prototype.off(type[, selector][, callback])**  
解除事件。由于type参数可以表示事件类型或（和）命名空间，解除事件的时候，需要事件类型，命名空间，选择器和处理函数需要同时相同才能解除，如果存在的话。  
@param type: 字符串，必选。需要解除的事件类型。支持命名空间。如有多个，用空格分隔，如".namespace"。  
@param selector: 字符串，可选。解除代理给selector指定的子元素上的事件。  
@param callback: 函数，可选。解除绑定在某事件上的某个函数。  
@return g对象。  

**g.prototype.trigger(type)**  
使用代码触发某类事件。  
@param type: 字符串，必选。需要触发的事件类型。如"tap"。  
@return g对象。  

**g.prototype.tap([selector, ][data, ]callback[, namespace])**  
绑定tap事件。  
@param selector: 字符串，可选。将事件代理给某些子元素=querySelectorAll(selector)。 
@param data: 对象，可选。绑定事件时将一些数据传递给处理函数。   
@param callback: 函数，必选。绑定在tap事件上的某个处理函数。  
@param namespace: 字符串，可选。命名空间。    
@return g对象。  
同样地，有doubletap，taphold，zoomin，zoomout，flick，scroll等方法。  

**g.opt(k, v)**  
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

**g.util.getPageX(e)**  
@param e: 原生事件e。  
@return pageX值。  

**g.util.getPageY(e)**  
@param e: 原生事件e。  
@return pageX值。  

**g.util.getDistance(p1, p2)**  
@param p1: [x, y]元组。  
@param p2: [x, y]元组。  
@return p1和p2两点之间的距离。  

**g.register(event, handler, ifBind)**  
@param event: 字符串，必选。注册的事件类型。如有多个，用空格分隔，如"zoomin zoomout"。  
@param handler: 对象，必选。一个包含touchstart，touchmove，touchend或者gesturestart，gesturechange，gestureend等属性的对象。分别表示这些事件触发时的处理函数，用于判断是否是@event事件。  
@param ifBind: 函数，可选。绑定该事件时，执行一些设置属性等操作。  
@return g函数。  

**g.unregister(event)**  
@param event: 字符串，必选。需要注销的事件类型。如有多个，用空格分隔，如"zoomin zoomout"。 
@return g函数。 

**g.createEvent(name, e, attrs)**  
@param name: 字符串，必选。需要新建的事件名称。  
@param e: 对象，必选。原生对象e，一般是touchend或者gestureend事件。  
@param attrs: 对象，可选。用于设置一些特殊属性，如flick事件中表示方向的属性direction。  
@return 无。  

# File List
1. gesture.js  

2. tap.js
引入tap事件类型，默认地tap事件在持续时间上没有限制，手指或者鼠标移动距离应小于30px。
3. doubletap.js  
引入doubletap事件类型，默认地两次tap之间的间隔小于250ms，则认定为是doubletap事件。但一次doubletap事件触发之前，肯定会有两次tap事件触发。  
4. tap-doubletap.js
引入tap和doubletap事件类型，也许你对tap.js和doubeltap.js的组合不够满意，不希望doubletap事件触发时，会触发两次tap事件，那么这个脚本就是为你准备的。每一个tap事件发生时，总要等待一段时间，直到250ms之后或者另一个tap事件发生，如果是前者，则触发一个tap事件，否则触发一个doubeltap事件。  
5. taphold.js  
引入taphold事件类型，首先修改tap事件最大持续时间为300ms，此时原本的tap事件就会被区分为两种，持续时间大于300ms的，则会定义为taphold事件。  
6. flick.js  
引入flick事件类型，条件是移动距离必须大于30px。flick仅仅是事件，即手指或鼠标移动过程中不会对元素产生影响，比如，不会拖动元素。这点是和drag区分开的。flick有一个属性direction，取值为up，down，left和right。
7. zoom.js  
引入zoomin和zoomout事件类型，分别表示两个手指向中点移动以及背离中点移动。默认地zoomin需要touch结束时两手指距离是开始时的至少1.2倍，zoomout最大是0.83倍。此事件只适用于支持multi-touch的移动设备。
8. dragdrop.js  
引入drag和drop**行为**类型，注意不是事件类型。对于支持HTML5 drag & drop API的浏览器，直接使用该API。对于不支持该API的浏览器，则会通过touch或者mouse事件模拟该API。使用方法参见[Sample](#Sample)。

9. plugin/touch-alink.js
修正这样一个[issue](http://jsfiddle.net/lichangwei/hLJH3/)，在iOS和Android设备中点击某元素X，在touchend事件触发时，隐藏元素X，如果此时手指下面还有一个链接元素A，那么很可能会触发A的click事件，即便在touchend事件中调用了```e.preventDefault(); e.stopPropagation();```。解决办法是：如果A链接元素上没有触发touchend事件，而直接触发click事件，那么取消其默认行为（跳转或者打开某个页面）。

# 示例 Sample  
``` javascript  
// 支持事件代理，支持同时绑定多个事件，支持namespace，支持链式调用
// 支持的事件包括tap，doubletap，taphold，flick，zoomin和zoomout。
g('#menu').on('tap doubletap.namespace', 'li', function(e){
  e.preventDefault();
}).doubletap(function(e){
  console.info(e.type);
});

g('.removable').draggable(ondragstart, ondrag, ondragend);
g('.recyclebin').dropable(ondragenter, ondragover, ondragleave, ondrop);
```

# 压缩脚本 Minimize gesture script  
只需要按照以下步骤即可自定义压缩gesture。  
(1) 执行命令 'npm install webtools'  
(2) 打开tools/minimize.js，注释掉你不需要的脚本文件，并修改initScript内容（比如删除，如果不需要的话）  
(3) 执行命令 'node minimize.js'，此步骤会生成一个新文件gesture-min.js  
(4) 将gesture-min.js引入到网站中  

# Q && A  
1. Q：如何实现iOS中的效果：快速点击（tap）正常响应相应动作，按住不放（taphold）会出现拷贝，打开链接等选项卡，双击（doubletap）会放大或者缩小页面？  
A：引入（1）gesture.js.（2）tap-doubletap.js，注册了tap和doubletap事件，tap行为完成之后并不会立即触发tap事件，而是等待下一次tap行为的发生。如果tap行为发生，则触发一个doubletap事件，如果在doubletap_max_interval = 250ms内都没有发生下一次的tap行为，则触发一个tap事件.（3）设置tap持续最大时间g.opt('tap_max_duration', 300)，其中300可以适当调整.（4）绑定tap事件即可。
