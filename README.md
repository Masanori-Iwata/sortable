# Sortable

http://www.masanoriiwata.jp/sortable/index.html


## Features

 * Simple and fast
 * Supports touch devices
 * Animation when moving
 * Auto scrolling
 * High performance
 * Use Babel
 * No jQuery

## Options

```js
new Sortable( {
  containerId        : 'sortable',
  draggingClass      : 'dragging',
  draggableClass     : 'draggable',
  itemAnimationMargin: 0,
  animateSpeed       : 150,
  sortableStartTime  : 300,
  scrollSpeedLevel   : 10,
  onDrag             : null,
  onDragged          : null,
  onSort             : null,
  onSorted           : null,
  onRefreshed        : null,
  onInitialized      : null
} );
```
## Example

```html
<ul id="sortable" class="sortable plugin">
  <li class="draggable"><span class="wrap"><span class="disc"></span></span></li>
  <li class="draggable"><span class="wrap"><span class="disc"></span></span></li>
  <li class="draggable"><span class="wrap"><span class="disc"></span></span></li>
  <li class="draggable"><span class="wrap"><span class="disc"></span></span></li>
  <li class="draggable"><span class="wrap"><span class="disc"></span></span></li>
</ul>
```

```js
window.addEventListener( 'DOMContentLoaded', function() {

  var sortable = new Sortable();

} );

```
## License
© 2016 - 2017 MASANORI IWATA <info@masanoriiwata.jp>

rangeSlider.js: http://www.masanoriiwata.jp/sortable/index.html

Released under the MIT licenses<br>
http://opensource.org/licenses/mit-license.php

