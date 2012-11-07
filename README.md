gesture，一个适用于移动终端和桌面浏览器的事件库，事件包括tap，doubletap，taphold，flick，zoomin，zoomout， scroll。  
优点：  
* 类似jQuery的API，使用方便。  
* 可以现在桌面浏览器上开发，然后在移动终端调试。  

# API：  
**g( elem )**  
创建一个gesture对象，然后可以绑定事件。  
@param elem: 需要绑定事件的DOM元素，必选。可以是DOM元素，DOM元素数组，NodeList，HTMLCollection或者jQuery对象。   
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
@param selector: 字符串，可选。将事件代理给某些子元素=querySelectorAll(selector)。  
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
@return 当前系统中@k的值。  
@k的值可以是以下之一：  
'tap_max_distance': tap事件的条件，开始和结束时手指移动距离最大为30px。  
'tap_max_duration': tap事件的条件，持续时间最大是300ms。（默认为Number.MAX_VALUE，即不管按下多长时间，都是tap。在taphold.js中将此值修改为300ms，
即小于等于300ms是tap，大于300ms是taphold。）  
'doubletap_max_interval': 双击事件中，两次单击之间的时间间隔最大为250ms。  
'flick_min_x_or_y': flick事件中，x或y方向最小移动距离是30px。  
'zoomin_max_scale': zoomin事件中，两个手指之间的距离最大是初始的0.83倍。  
'zoomout_min_scale': zoomout事件中，两个手指之间的距离最大是初始的1.2倍。  

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

# Sample  
``` javascript  
// 通过事件代理，处理每个菜单项的tap事件
g('#menu').on('tap', 'li', function(e){
    e.original.preventDefault(); //e.original is touchend/mouseup
    
});
```

# Q && A  
