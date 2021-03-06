/**
* sortable.js v1.0.0
* 
* © 2016 - 2017 MASANORI IWATA <info@masanoriiwata.jp>
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
**/
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.sortableBabel = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _wrap(elem, wrapName) {

    var wrapper = document.createElement(wrapName);
    var fragment = document.createDocumentFragment();
    var nodes = elem.childNodes;
    while (nodes.length && fragment.appendChild(nodes[0])) {}
    wrapper.appendChild(fragment);
    elem.insertBefore(wrapper, null);

    fragment = null;
    nodes = null;


    return wrapper;
  }

  function _findIndex(elems, elem) {

    var i = elems.length;
    for (; i--;) {

      if (elem === elems[i]) {

        return i;
      }
    }
  }

  function _forcedSynchronousLayout(elem) {

    return elem.offsetWidth;
  }

  function _debounce(callback, delay) {

    var timer = void 0;
    return function () {

      clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
  }

  function _getVendorName() {

    var ua = window.navigator.userAgent;
    var vendors = {
      '-webkit-': /Chrome|Safari/,
      '-moz-': /Firefox/,
      '-ms-': /MSIE|Trident|IEMobile/,
      '-o-': /Opera/
    };

    var vendor = '';
    for (var name in vendors) {

      if (vendors[name].test(ua)) {

        vendor = name;
        break;
      }
    }

    return vendor;
  }

  function _setVendorPrefix(names) {

    var style = document.createElement('div').style;
    var vendor = _getVendorName();
    var props = {};
    var callback = function callback(prop) {

      return props[prop] = function (s, p) {

        if (!(p in s)) {

          return vendor + p;
        }

        return p;
      }(style, prop);
    };

    names.forEach(callback);
    style = null;
    return props;
  }

  function _getTouchY(e) {

    return e.clientY === undefined ? e.touches[0].clientY : e.clientY;
  }

  function _timeLag(timerId, callback, speed) {

    clearTimeout(timerId);
    timerId = setTimeout(function () {

      callback();
      timerId = null;
    }, speed);
  }

  var _state = {
    isOne: false
  };

  var _ua = {
    isiOS: /iPhone|iPod|iPad/.test(window.navigator.userAgent),
    isMobile: /Mobi/i.test(window.navigator.userAgent),
    isWebkit: /Chrome|Safari/.test(window.navigator.userAgent)
  };

  var _scroll = {
    limit: 0
  };

  var _viewport = {
    wrapper: null
  };

  var _cssAnimationStyles = {};

  var Sortable = function () {
    _createClass(Sortable, null, [{
      key: 'defaults',
      value: function defaults() {

        return {

          options: {
            containerId: 'sortable',
            draggingClass: 'dragging',
            draggableClass: 'draggable',
            itemAnimationMargin: 0,
            animateSpeed: 150,
            sortableStartTime: 300,
            scrollSpeedLevel: 10,
            onDrag: null,
            onDragged: null,
            onSort: null,
            onSorted: null,
            onRefreshed: null,
            onInitialized: null
          },
          container: {
            elem: null,
            top: 0,
            clientHeight: 0
          },
          drag: {
            elem: null,
            siblingElem: null,
            sorting: null,
            index: 0,
            indexing: 0,
            startY: 0,
            moveY: 0,
            translateY: 0
          },
          item: {
            collection: [],
            length: 0,
            height: 0
          },
          state: {
            isUp: false,
            isDown: false,
            isSortable: false,
            isInserting: false,
            isOverflow: false,
            isChainable: true
          },
          scroll: {
            elem: null,
            limit: 0,
            offsetY: 0,
            viewHeight: 0,
            originScrollTop: 0
          },
          viewport: {
            inElementLength: 0
          }

        };
      }
    }]);

    function Sortable() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Sortable);

      this.defaults = this.constructor.defaults();
      for (var key in this.defaults) {

        if (Object.prototype.hasOwnProperty.call(this.defaults, key)) {

          this[key] = _extends({}, this.defaults[key], key === 'options' ? options : {});
        }
      }

      this.container.elem = document.getElementById(this.options.containerId);

      this.setup();
      this.init();
    }

    _createClass(Sortable, [{
      key: 'setup',
      value: function setup() {

        _cssAnimationStyles = _setVendorPrefix(['transition', 'will-change', 'transform']);

        this.onResize = _ua.isMobile ? this.refresh.bind(this) : _debounce.call(this, this.refresh.bind(this), 150);
        this.onDragstart = this.dragstart.bind(this);
        this.onDragmove = this.dragmove.bind(this);
        this.onDragend = this.dragend.bind(this);
        this.updating = this.update.bind(this);
      }
    }, {
      key: 'init',
      value: function init() {
        var _this = this;

        this.$(window).on('resize');

        // Setup item
        this.item = _extends({}, function (col) {

          // Setup default properties
          var options = function options(elem) {
            return elem.sortable = _this.defaults.item.sortable;
          };
          col.map(options);

          return {
            collection: col,
            height: col[0].offsetHeight,
            length: col.length
          };
        }([].concat(_toConsumableArray(this.container.elem.children))));

        // Setup container
        this.container.clientHeight = this.item.length * this.item.height + (window.parseInt(window.getComputedStyle(this.container.elem)['padding-top']) + window.parseInt(window.getComputedStyle(this.container.elem)['padding-bottom']));
        // Setup scoll
        this.scroll.elem = function (elem) {

          while (elem.parentNode) {

            if (window.getComputedStyle(elem)['overflow-y'] !== 'visible') {

              _this.state.isOverflow = true;
              _this.scroll.viewHeight = elem.clientHeight;
              _this.scroll.limit = _this.container.clientHeight - _this.scroll.viewHeight;
              break;
            }

            if (_state.isOne || elem.tagName === 'BODY') {

              _this.scroll.viewHeight = window.innerHeight;
            }

            if (_state.isOne) {

              elem = _viewport.wrapper;
              _this.scroll.limit = _scroll.limit;
              break;
            }

            if (elem.tagName === 'BODY') {

              elem = !_ua.isWebkit && !_ua.isMobile ? document.documentElement : document.body;
              _this.scroll.limit = document.body.clientHeight - _this.scroll.viewHeight;

              if (_ua.isiOS && !_state.isOne) {

                _scroll.limit = _this.scroll.limit;

                elem = _viewport.wrapper = _wrap(document.body, 'div');
                elem.id = 'for-ios';
                elem.style.cssText = 'overflow-y: auto; -webkit-overflow-scrolling: touch;';

                _state.isOne = true;
              }

              break;
            }

            elem = elem.parentNode;
          }

          return elem;
        }(this.container.elem);

        if (_ua.isiOS) {

          // Scroll can't be default prevented on touchmove event on iOS 10.
          this.scroll.elem.addEventListener('touchmove', function () {});
        }

        [].forEach.call(this.item.collection, function (elem) {
          return _this.$(elem).on('touchstart mousedown');
        });

        this.refresh();
        this.callback('onInitialized');
      }
    }, {
      key: 'on',
      value: function on(event) {

        if (!this.state.isChainable) return this;
        this.listener(event, 'add');
        return this;
      }
    }, {
      key: 'off',
      value: function off(event) {

        if (!this.state.isChainable) return this;
        this.listener(event, 'remove');
        return this;
      }
    }, {
      key: 'listener',
      value: function listener(eventTypes, actionType) {
        var _this2 = this;

        var handlers = {
          resize: [this.onResize, false],
          touchstart: [this.onDragstart, false],
          mousedown: [this.onDragstart, false],
          touchmove: [this.onDragmove, false],
          mousemove: [this.onDragmove, false],
          touchend: [this.onDragend, false],
          mouseup: [this.onDragend, false]
        };
        var wrap = function wrap(action, eventName, handler) {
          var _$$elem;

          var args = [eventName, handler[0]].concat(_toConsumableArray(handler.slice(1))).concat();

          if (!_this2.listener.cache) _this2.listener.cache = {};
          if (action === 'add') _this2.listener.cache[eventName] = args;
          if (_this2.listener.cache[eventName]) (_$$elem = _this2.$.elem)[action + 'EventListener'].apply(_$$elem, _toConsumableArray(_this2.listener.cache[eventName]));
          if (action === 'remove') delete _this2.listener.cache[eventName];
        };

        eventTypes.split(' ').forEach(function (key) {
          return wrap(actionType, key, handlers[key]);
        });
      }
    }, {
      key: 'refresh',
      value: function refresh() {

        if (!this.state.isOverflow) {

          this.scroll.viewHeight = window.innerHeight;
        }

        this.viewport.inElementLength = Math.ceil(this.scroll.viewHeight / this.item.height);

        if (_ua.isiOS) {

          this.$(_viewport.wrapper).style('height', window.innerHeight + 'px');
        }

        this.callback('onRefreshed');
      }
    }, {
      key: '$',
      value: function $(elem) {

        this.$.elem = null;
        this.$.elem = elem;
        this.state.isChainable = true;
        return this;
      }
    }, {
      key: 'if',
      value: function _if(boolean) {

        this.state.isChainable = !!boolean;
        return this;
      }
    }, {
      key: 'dragstart',
      value: function dragstart(e) {
        var _this3 = this;

        if (this.state.isInserting) return;

        // The target element.
        this.drag.elem = function (t) {

          while (t.parentNode && !t.classList.contains(_this3.options.draggableClass)) {

            t = t.parentNode;
          }

          return t;
        }(e.target);

        // Position of value.
        this.drag.moveY = this.drag.startY = _getTouchY(e);
        // To get an index the element.
        this.drag.indexing = this.drag.index = _findIndex(this.item.collection, this.drag.elem);

        this.$(_ua.isMobile ? this.drag.elem : window).on('touchmove touchend mousemove mouseup');

        this.$(this.drag.elem).style(_cssAnimationStyles['will-change'], _cssAnimationStyles.transform);

        this.drag.sorting = setTimeout(function () {

          _this3.state.isSortable = true;

          _this3.callback('onDrag');
          _this3.sortstart();
        }, this.options.sortableStartTime);
      }
    }, {
      key: 'dragmove',
      value: function dragmove(e) {

        if (this.drag.sorting) {

          clearTimeout(this.drag.sorting);
          this.drag.sorting = null;
        }

        if (!this.state.isSortable) return;

        e.preventDefault();

        this.drag.moveY = _getTouchY(e);
      }
    }, {
      key: 'dragend',
      value: function dragend() {

        clearTimeout(this.drag.sorting);
        this.drag.sorting = null;

        this.$(_ua.isMobile ? this.drag.elem : window).off('touchmove touchend mousemove mouseup');

        // No sortable.
        if (!this.state.isSortable) {

          this.$(this.drag.elem).style(_cssAnimationStyles['will-change'], '');
          return;
        }

        this.sortend();
        this.callback('onDragged');
      }
    }, {
      key: 'sortstart',
      value: function sortstart() {

        this.scroll.originScrollTop = this.scroll.elem.scrollTop;
        this.container.top = this.state.isOverflow ? this.container.elem.getBoundingClientRect().top : 0;

        this.drag.elem.classList.add(this.options.draggingClass);

        // Animation start.
        this.$(this.drag.elem).setupAnimation('previous').setupAnimation('next');

        requestAnimationFrame(this.updating);
      }
    }, {
      key: 'sorting',
      value: function sorting() {

        this.drag.translateY = this.drag.moveY - this.drag.startY + this.scroll.offsetY;
        this.$(this.drag.elem).style(_cssAnimationStyles.transform, 'translateY( ' + this.drag.translateY + 'px )');
      }
    }, {
      key: 'sortend',
      value: function sortend() {

        this.reposition();
        this.animationCleaner();

        // Reset of value.
        this.state.isSortable = false;
        this.scroll.offsetY = 0;
      }
    }, {
      key: 'update',
      value: function update() {

        if (!this.state.isSortable) return;

        // Call self.
        requestAnimationFrame(this.updating);

        this.scrollTo();
        this.sorting();

        var rootPos = this.drag.index * this.item.height;
        var dragMoveY = rootPos + this.drag.translateY;

        var prevLimitY = (this.drag.indexing - 1) * this.item.height + this.options.itemAnimationMargin;
        var nextLimitY = (this.drag.indexing + 1) * this.item.height - this.options.itemAnimationMargin;

        // Move up.
        this.state.isUp = dragMoveY < prevLimitY && this.drag.indexing > 0;
        // Move down.
        this.state.isDown = dragMoveY > nextLimitY && this.drag.indexing < this.item.length - 1;

        // Do any sorting.
        if (this.state.isUp || this.state.isDown) {

          this.siblingAnimation();
          this.outViewport();

          this.callback('onSort');
        }
      }
    }, {
      key: 'siblingAnimation',
      value: function siblingAnimation() {

        var order = void 0;
        if (this.state.isUp) {

          order = 'previous';
          this.drag.indexing--;
        } else if (this.state.isDown) {

          order = 'next';
          this.drag.indexing++;
        }

        this.drag.siblingElem = this.item.collection[this.drag.indexing];

        // Update -> this.drag.siblingElem
        this.$(this.drag.siblingElem).setupAnimation(order);
        this.$(this.drag.siblingElem).style(_cssAnimationStyles.transform, 'translateY( ' + this.siblingPosAdjust() + 'px )');

        this.collectionUpdate();
      }
    }, {
      key: 'collectionUpdate',
      value: function collectionUpdate() {
        var _item$collection;

        (_item$collection = this.item.collection).splice.apply(_item$collection, _toConsumableArray(function (_ref, _ref2, _ref3) {
          var isUp = _ref.isUp,
              isDown = _ref.isDown;
          var indexing = _ref2.indexing;
          var collection = _ref3.collection;


          if (isUp) {

            return [indexing, 2, collection[indexing + 1], collection[indexing]];
          } else if (isDown) {

            return [indexing - 1, 2, collection[indexing], collection[indexing - 1]];
          }
        }(this.state, this.drag, this.item)));
      }
    }, {
      key: 'siblingPosAdjust',
      value: function siblingPosAdjust() {

        var isLargeIndex = this.drag.index < this.drag.indexing;
        var isSameIndex = this.drag.index === this.drag.indexing;
        var translateY = 0;

        if (this.state.isUp && !isLargeIndex && !isSameIndex) {

          translateY = this.item.height;
        } else if (this.state.isDown && isLargeIndex && !isSameIndex) {

          translateY = '-' + this.item.height;
        }

        return translateY;
      }
    }, {
      key: 'setupAnimation',
      value: function setupAnimation(order) {
        var _$$style;

        if (!this.state.isChainable) return this;

        var sibling = this.$.elem[order + 'ElementSibling'];
        if (sibling === this.drag.elem) {

          sibling = sibling[order + 'ElementSibling'];
        }

        if (!sibling) return this;

        this.$(sibling).style((_$$style = {}, _defineProperty(_$$style, _cssAnimationStyles['will-change'], _cssAnimationStyles.transform), _defineProperty(_$$style, _cssAnimationStyles.transition, _cssAnimationStyles.transform + ' ' + this.options.animateSpeed + 'ms ease-in-out'), _$$style));

        this.removeAnimation();

        return this;
      }
    }, {
      key: 'removeAnimation',
      value: function removeAnimation() {
        var _this4 = this;

        var siblingeds = [[this.getSiblinged(2), _cssAnimationStyles['will-change'], ''], [this.getSiblinged(this.viewport.inElementLength), _cssAnimationStyles.transition, '']];

        var moveAnimated = function moveAnimated(elem, prop, val) {

          return function () {

            var $ = _this4.$(elem);
            $.if($.style(prop) !== '').style.call(_this4, prop, val);
          };
        };

        for (var i = siblingeds.length, siblinged; i-- && (siblinged = siblingeds[i]);) {

          var elem = siblinged[0];
          if (elem && elem !== this.$.elem) {

            var args = siblinged.slice(1);
            _timeLag(siblinged[0].moveAnimated, moveAnimated.apply(undefined, [elem].concat(_toConsumableArray(args))), 200);
          }
        }
      }
    }, {
      key: 'getSiblinged',
      value: function getSiblinged(num) {

        if (this.state.isUp) {

          return this.item.collection[this.drag.indexing + num];
        } else if (this.state.isDown) {

          return this.item.collection[this.drag.indexing - num];
        }
      }
    }, {
      key: 'reposition',
      value: function reposition() {
        var _$$style2;

        var insertElem = this.item.collection[this.drag.indexing + 1];
        var translateY = (this.drag.index - this.drag.indexing) * this.item.height + this.drag.translateY;

        this.drag.elem.parentNode.insertBefore(this.drag.elem, insertElem);

        this.$(this.drag.elem).style(_cssAnimationStyles.transform, 'translateY( ' + translateY + 'px )');

        _forcedSynchronousLayout(this.drag.elem);

        this.$(this.drag.elem).style((_$$style2 = {}, _defineProperty(_$$style2, _cssAnimationStyles.transition, _cssAnimationStyles.transform + ' ' + this.options.animateSpeed + 'ms ease-out'), _defineProperty(_$$style2, _cssAnimationStyles.transform, 'translateY( 0px )'), _$$style2));

        this.state.isInserting = true;
      }
    }, {
      key: 'animationCleaner',
      value: function animationCleaner() {
        var _this5 = this;

        var dragEndAnimated = function dragEndAnimated() {
          var _removeStyle;

          var removeStyle = (_removeStyle = {}, _defineProperty(_removeStyle, _cssAnimationStyles.transform, ''), _defineProperty(_removeStyle, _cssAnimationStyles.transition, ''), _defineProperty(_removeStyle, _cssAnimationStyles['will-change'], ''), _removeStyle);

          var resetItemState = function resetItemState(elem) {

            elem.outViewportTranslateY = '';
            elem.moveAnimated = null;
            elem.endAnimated = null;
          };

          _this5.drag.elem.classList.remove(_this5.options.draggingClass);
          _this5.$(_this5.drag.elem).style(removeStyle);

          _this5.callback('onSorted');

          // Reset of value.
          _this5.$.elem = null;
          _this5.drag.elem = null;
          _this5.drag.siblingElem = null;
          _this5.state.isInserting = false;
          _this5.item.collection.map(resetItemState);
        };

        var otherEndAnimated = function otherEndAnimated(elem) {

          if (elem.hasAttribute('style') && _this5.drag.elem !== elem) {

            var $ = _this5.$(elem);
            $.if($.style(_cssAnimationStyles.transform) !== '').style(_cssAnimationStyles.transform, '').if($.style(_cssAnimationStyles.transition) !== '').style(_cssAnimationStyles.transition, '').if($.style(_cssAnimationStyles['will-change']) !== '').style(_cssAnimationStyles['will-change'], '');
          }
        };

        // Element of other
        this.item.collection.forEach(otherEndAnimated);
        // Drag element
        _timeLag(this.drag.elem.endAnimated, dragEndAnimated, this.options.animateSpeed + 200);
      }
    }, {
      key: 'outViewport',
      value: function outViewport() {

        var offsetLength = Math.ceil(this.viewport.inElementLength + this.viewport.inElementLength / 2);
        var i = this.drag.indexing;
        var j = i;

        if (this.state.isUp) {

          i += offsetLength;
          j -= offsetLength - 2;
        } else if (this.state.isDown) {

          i -= offsetLength;
          j += offsetLength - 1;
        }

        // Remove style
        if (i >= 0 && i < this.item.length) {

          var removeStyleElem = this.item.collection[i];
          var translateVal = this.$(removeStyleElem).style(_cssAnimationStyles.transform);

          if (translateVal) {

            if (this.state.isDown) {

              i++;
            }

            removeStyleElem.outViewportTranslateY = translateVal;
            this.$(removeStyleElem).style(_cssAnimationStyles.transform, '');
          }
        }

        // Add style
        if (j > 0 && j < this.item.length && this.item.collection[j].outViewportTranslateY) {

          var addStyleElem = this.item.collection[j - 1];
          this.$(addStyleElem).style(_cssAnimationStyles.transform, this.item.collection[j].outViewportTranslateY);
        }
      }
    }, {
      key: 'scrollTo',
      value: function scrollTo() {

        var OFFSETZONE = 1;
        var moveY = this.drag.moveY;
        var scrollSpeedLevel = this.options.scrollSpeedLevel;
        var offsetTop = Math.max(this.container.top, 0);
        var offsetBottom = Math.min(this.container.top, window.innerHeight - this.scroll.viewHeight);
        var up = OFFSETZONE * scrollSpeedLevel - (moveY - offsetTop) / this.item.height * scrollSpeedLevel;
        var down = OFFSETZONE * scrollSpeedLevel - (this.scroll.viewHeight - (moveY - offsetBottom)) / this.item.height * scrollSpeedLevel;

        if (up > 0) {

          this.scroll.elem.scrollTop -= up;
        } else if (down > 0) {

          this.scroll.elem.scrollTop += this.scrollLimit(down);
        }

        this.scroll.offsetY = this.scroll.elem.scrollTop - this.scroll.originScrollTop;
      }
    }, {
      key: 'scrollLimit',
      value: function scrollLimit(val) {

        var scrollTop = this.scroll.elem.scrollTop;
        if (this.scroll.limit <= scrollTop) {

          return -(scrollTop - this.scroll.limit);
        }

        return val;
      }
    }, {
      key: 'style',
      value: function style(props, val) {

        if (!this.state.isChainable) return this;
        switch (arguments.length) {

          case 2:
            {

              this.$.elem.style[props] = val;
              return this;
            }

          case 1:
          default:
            {

              if (Object.prototype.toString.call(props) === '[object Object]') {

                for (var prop in props) {

                  if (Object.prototype.hasOwnProperty.call(props, prop)) {

                    this.$.elem.style[prop] = props[prop];
                  }
                }

                return this;
              }

              if (this.$.elem.hasAttribute('style') && this.$.elem.getAttribute('style').includes(props + ':')) {

                return this.$.elem.style[props];
              }

              return null;
            }

        }
      }
    }, {
      key: 'callback',
      value: function callback(name) {

        if (typeof this.options[name] === 'function') {

          this.options[name].call(this, this.drag.elem, this.drag.siblingElem, this.drag.index, this.drag.indexing);
        }
      }
    }]);

    return Sortable;
  }();

  exports.default = Sortable;

  window.Sortable = Sortable;
});
