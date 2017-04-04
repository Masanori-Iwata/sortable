
function _wrap( elem, wrapName ) {

  const wrapper = document.createElement( wrapName );
  let fragment = document.createDocumentFragment();
  let nodes = elem.childNodes;
  while ( nodes.length && fragment.appendChild( nodes[ 0 ] ) ) {}
  wrapper.appendChild( fragment );
  elem.insertBefore( wrapper, null );

  [ fragment, nodes ] = [ null, null ];

  return wrapper;

}

function _findIndex( elems, elem ) {

  let i = elems.length;
  for ( ; i--; ) {

    if ( elem === elems[ i ] ) {

      return i;

    }

  }

}

function _forcedSynchronousLayout( elem ) {

  return elem.offsetWidth;

}

function _debounce( callback, delay ) {

  let timer;
  return () => {

    clearTimeout( timer );
    timer = setTimeout( callback, delay );

  };

}

function _getVendorName() {

  const ua = window.navigator.userAgent;
  const vendors = {
    '-webkit-': /Chrome|Safari/,
    '-moz-'   : /Firefox/,
    '-ms-'    : /MSIE|Trident|IEMobile/,
    '-o-'     : /Opera/
  };

  let vendor = '';
  for ( let name in vendors ) {

    if ( vendors[ name ].test( ua ) ) {

      vendor = name;
      break;

    }

  }

  return vendor;

}

function _setVendorPrefix( names ) {

  let style = document.createElement( 'div' ).style;
  const vendor = _getVendorName();
  const props = {};
  const callback = ( prop ) => {

    return props[ prop ] = ( ( s, p ) => {

      if ( !( p in s ) ) {

        return vendor + p;

      }

      return p;

    } )( style, prop );

  };

  names.forEach( callback );
  style = null;
  return props;

}

function _getTouchY( e ) {

  return ( e.clientY === undefined ? e.touches[ 0 ].clientY : e.clientY );

}

function _timeLag( timerId, callback, speed ) {

  clearTimeout( timerId );
  timerId = setTimeout( () => {

    callback();
    timerId = null;

  }, speed );

}

const _state = {
  isOne: false
};

const _ua = {
  isiOS   : /iPhone|iPod|iPad/.test( window.navigator.userAgent ),
  isMobile: /Mobi/i.test( window.navigator.userAgent ),
  isWebkit: /Chrome|Safari/.test( window.navigator.userAgent )
};

const _scroll = {
  limit: 0
};

const _viewport = {
  wrapper: null
};

let _cssAnimationStyles = {};

class Sortable {

  static defaults() {

    return {

      options: {
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
      },
      container: {
        elem        : null,
        top         : 0,
        clientHeight: 0
      },
      drag: {
        elem       : null,
        siblingElem: null,
        sorting    : null,
        index      : 0,
        indexing   : 0,
        startY     : 0,
        moveY      : 0,
        translateY : 0
      },
      item: {
        collection: [],
        length    : 0,
        height    : 0
      },
      state: {
        isUp       : false,
        isDown     : false,
        isSortable : false,
        isInserting: false,
        isOverflow : false,
        isChainable: true
      },
      scroll: {
        elem           : null,
        limit          : 0,
        offsetY        : 0,
        viewHeight     : 0,
        originScrollTop: 0
      },
      viewport: {
        inElementLength: 0
      }

    };

  }

  constructor( options = {} ) {

    this.defaults = this.constructor.defaults();
    for ( let key in this.defaults ) {

      if ( Object.prototype.hasOwnProperty.call( this.defaults, key ) ) {

        this[ key ] = {...this.defaults[ key ], ...( key === 'options' ? options : {} )};

      }

    }

    this.container.elem = document.getElementById( this.options.containerId );

    this.setup();
    this.init();

  }

  setup() {

    _cssAnimationStyles = _setVendorPrefix( [

      'transition',
      'will-change',
      'transform'

    ] );

    this.onResize = _ua.isMobile ? this.refresh.bind( this ) : _debounce.call( this, this.refresh.bind( this ), 150 );
    this.onDragstart = this.dragstart.bind( this );
    this.onDragmove = this.dragmove.bind( this );
    this.onDragend = this.dragend.bind( this );
    this.updating = this.update.bind( this );

  }

  init() {

    this.$( window ).on( 'resize' );

    // Setup item
    this.item = {
      ...( ( col ) => {

        // Setup default properties
        const options = ( elem ) => elem.sortable = this.defaults.item.sortable;
        col.map( options );

        return {
          collection: col,
          height    : col[ 0 ].offsetHeight,
          length    : col.length
        };

      } )( [ ...this.container.elem.children ] )

    };

    // Setup container
    this.container.clientHeight = this.item.length * this.item.height + (

      window.parseInt( window.getComputedStyle( this.container.elem )[ 'padding-top' ] ) +
      window.parseInt( window.getComputedStyle( this.container.elem )[ 'padding-bottom' ] )

    );
    // Setup scoll
    this.scroll.elem = ( ( elem ) => {

      while ( elem.parentNode ) {

        if ( window.getComputedStyle( elem )[ 'overflow-y' ] !== 'visible' ) {

          this.state.isOverflow = true;
          this.scroll.viewHeight = elem.clientHeight;
          this.scroll.limit = this.container.clientHeight - this.scroll.viewHeight;
          break;

        }

        if ( _state.isOne || elem.tagName === 'BODY' ) {

          this.scroll.viewHeight = window.innerHeight;

        }

        if ( _state.isOne ) {

          elem = _viewport.wrapper;
          this.scroll.limit = _scroll.limit;
          break;

        }

        if ( elem.tagName === 'BODY' ) {

          elem = !_ua.isWebkit && !_ua.isMobile ? document.documentElement : document.body;
          this.scroll.limit = document.body.clientHeight - this.scroll.viewHeight;

          if ( _ua.isiOS && !_state.isOne ) {

            _scroll.limit = this.scroll.limit;

            elem = _viewport.wrapper = _wrap( document.body, 'div' );
            elem.id = 'for-ios';
            elem.style.cssText = 'overflow-y: auto; -webkit-overflow-scrolling: touch;';

            _state.isOne = true;

          }

          break;

        }

        elem = elem.parentNode;

      }

      return elem;

    } )( this.container.elem );

    if ( _ua.isiOS ) {

      // Scroll can't be default prevented on touchmove event on iOS 10.
      this.scroll.elem.addEventListener( 'touchmove', function() {} );

    }

    [].forEach.call( this.item.collection, ( elem ) => this.$( elem ).on( 'touchstart mousedown' ) );

    this.refresh();
    this.callback( 'onInitialized' );

  }

  on( event ) {

    if ( !this.state.isChainable ) return this;
    this.listener( event, 'add' );
    return this;

  }

  off( event ) {

    if ( !this.state.isChainable ) return this;
    this.listener( event, 'remove' );
    return this;

  }

  listener( eventTypes, actionType ) {

    const handlers = {
      resize    : [ this.onResize, false ],
      touchstart: [ this.onDragstart, false ],
      mousedown : [ this.onDragstart, false ],
      touchmove : [ this.onDragmove, false ],
      mousemove : [ this.onDragmove, false ],
      touchend  : [ this.onDragend, false ],
      mouseup   : [ this.onDragend, false ]
    };
    const wrap = ( action, eventName, handler ) => {

      const args = [
        ...[
          eventName, handler[ 0 ],
          ...handler.slice( 1 )
        ]
      ];

      if ( !this.listener.cache ) this.listener.cache = {};
      if ( action === 'add' ) this.listener.cache[ eventName ] = args;
      if ( this.listener.cache[ eventName ] ) this.$.elem[ `${action}EventListener` ]( ...this.listener.cache[ eventName ] );
      if ( action === 'remove' ) delete this.listener.cache[ eventName ];

    };

    eventTypes.split( ' ' ).forEach( ( key ) => wrap( actionType, key, handlers[ key ] ) );

  }

  refresh() {

    if ( !this.state.isOverflow ) {

      this.scroll.viewHeight = window.innerHeight;

    }

    this.viewport.inElementLength = Math.ceil( this.scroll.viewHeight / this.item.height );

    if ( _ua.isiOS ) {

      this.$( _viewport.wrapper ).style( 'height', `${window.innerHeight}px` );

    }

    this.callback( 'onRefreshed' );

  }

  $( elem ) {

    this.$.elem = null;
    this.$.elem = elem;
    this.state.isChainable = true;
    return this;

  }

  if( boolean ) {

    this.state.isChainable = !!boolean;
    return this;

  }

  dragstart( e ) {

    if ( this.state.isInserting ) return;

    // The target element.
    this.drag.elem = ( ( t ) => {

      while ( t.parentNode && !t.classList.contains( this.options.draggableClass ) ) {

        t = t.parentNode;

      }

      return t;

    } )( e.target );

    // Position of value.
    this.drag.moveY = this.drag.startY = _getTouchY( e );
    // To get an index the element.
    this.drag.indexing = this.drag.index = _findIndex( this.item.collection, this.drag.elem );

    this.$( _ua.isMobile ? this.drag.elem : window ).on( 'touchmove touchend mousemove mouseup' );

    this.$( this.drag.elem ).style( _cssAnimationStyles[ 'will-change' ], _cssAnimationStyles.transform );

    this.drag.sorting = setTimeout( () => {

      this.state.isSortable = true;

      this.callback( 'onDrag' );
      this.sortstart();

    }, this.options.sortableStartTime );

  }

  dragmove( e ) {

    if ( this.drag.sorting ) {

      clearTimeout( this.drag.sorting );
      this.drag.sorting = null;

    }

    if ( !this.state.isSortable ) return;

    e.preventDefault();

    this.drag.moveY = _getTouchY( e );

  }

  dragend() {

    clearTimeout( this.drag.sorting );
    this.drag.sorting = null;

    this.$( _ua.isMobile ? this.drag.elem : window ).off( 'touchmove touchend mousemove mouseup' );

    // No sortable.
    if ( !this.state.isSortable ) {

      this.$( this.drag.elem ).style( _cssAnimationStyles[ 'will-change' ], '' );
      return;

    }

    this.sortend();
    this.callback( 'onDragged' );

  }

  sortstart() {

    this.scroll.originScrollTop = this.scroll.elem.scrollTop;
    this.container.top = this.state.isOverflow ? this.container.elem.getBoundingClientRect().top : 0;

    this.drag.elem.classList.add( this.options.draggingClass );

    // Animation start.
    this.$( this.drag.elem ).setupAnimation( 'previous' ).setupAnimation( 'next' );

    requestAnimationFrame( this.updating );

  }

  sorting() {

    this.drag.translateY = this.drag.moveY - this.drag.startY + this.scroll.offsetY;
    this.$( this.drag.elem ).style( _cssAnimationStyles.transform, `translateY( ${this.drag.translateY}px )` );

  }

  sortend() {

    this.reposition();
    this.animationCleaner();

    // Reset of value.
    this.state.isSortable = false;
    this.scroll.offsetY = 0;

  }

  update() {

    if ( !this.state.isSortable ) return;

    // Call self.
    requestAnimationFrame( this.updating );

    this.scrollTo();
    this.sorting();

    const rootPos = this.drag.index * this.item.height;
    const dragMoveY = rootPos + this.drag.translateY;

    const prevLimitY = ( this.drag.indexing - 1 ) * this.item.height + this.options.itemAnimationMargin;
    const nextLimitY = ( this.drag.indexing + 1 ) * this.item.height - this.options.itemAnimationMargin;

    // Move up.
    this.state.isUp = dragMoveY < prevLimitY && this.drag.indexing > 0;
    // Move down.
    this.state.isDown = dragMoveY > nextLimitY && this.drag.indexing < ( this.item.length - 1 );

    // Do any sorting.
    if ( this.state.isUp || this.state.isDown ) {

      this.siblingAnimation();
      this.outViewport();

      this.callback( 'onSort' );

    }

  }

  siblingAnimation() {

    let order;
    if ( this.state.isUp ) {

      order = 'previous';
      this.drag.indexing--;

    } else if ( this.state.isDown ) {

      order = 'next';
      this.drag.indexing++;

    }

    this.drag.siblingElem = this.item.collection[ this.drag.indexing ];

    // Update -> this.drag.siblingElem
    this.$( this.drag.siblingElem ).setupAnimation( order );
    this.$( this.drag.siblingElem ).style( _cssAnimationStyles.transform, `translateY( ${this.siblingPosAdjust()}px )` );

    this.collectionUpdate();

  }

  collectionUpdate() {

    this.item.collection.splice( ...( (
      {isUp, isDown},
      {indexing},
      {collection}
    ) => {

      if ( isUp ) {

        return [ indexing, 2, collection[ ( indexing + 1 ) ], collection[ indexing ] ];

      } else if ( isDown ) {

        return [ indexing - 1, 2, collection[ ( indexing ) ], collection[ indexing - 1 ] ];

      }

    } )( this.state, this.drag, this.item ) );

  }

  siblingPosAdjust() {

    const isLargeIndex = this.drag.index < this.drag.indexing;
    const isSameIndex = this.drag.index === this.drag.indexing;
    let translateY = 0;

    if ( this.state.isUp && !isLargeIndex && !isSameIndex ) {

      translateY = this.item.height;

    } else if ( this.state.isDown && isLargeIndex && !isSameIndex ) {

      translateY = `-${this.item.height}`;

    }

    return translateY;

  }

  setupAnimation( order ) {

    if ( !this.state.isChainable ) return this;

    let sibling = this.$.elem[ `${order}ElementSibling` ];
    if ( sibling === this.drag.elem ) {

      sibling = sibling[ `${order}ElementSibling` ];

    }

    if ( !sibling ) return this;

    this.$( sibling ).style( {
      [ _cssAnimationStyles[ 'will-change' ] ]: _cssAnimationStyles.transform,
      [ _cssAnimationStyles.transition ]      : `${_cssAnimationStyles.transform} ${this.options.animateSpeed}ms ease-in-out`
    } );

    this.removeAnimation();

    return this;

  }

  removeAnimation() {

    const siblingeds = [
      [ this.getSiblinged( 2 ), _cssAnimationStyles[ 'will-change' ], '' ],
      [ this.getSiblinged( this.viewport.inElementLength ), _cssAnimationStyles.transition, '' ]
    ];

    const moveAnimated = ( elem, prop, val ) => {

      return () => {

        const $ = this.$( elem );
        $.if( $.style( prop ) !== '' ).style.call( this, prop, val );

      };

    };

    for ( let i = siblingeds.length, siblinged; i-- && ( siblinged = siblingeds[ i ] ); ) {

      const elem = siblinged[ 0 ];
      if ( elem && elem !== this.$.elem ) {

        const args = siblinged.slice( 1 );
        _timeLag( siblinged[ 0 ].moveAnimated, moveAnimated( elem, ...args ), 200 );

      }

    }

  }

  getSiblinged( num ) {

    if ( this.state.isUp ) {

      return this.item.collection[ this.drag.indexing + num ];

    } else if ( this.state.isDown ) {

      return this.item.collection[ this.drag.indexing - num ];

    }

  }

  reposition() {

    const insertElem = this.item.collection[ this.drag.indexing + 1 ];
    const translateY = ( this.drag.index - this.drag.indexing ) * this.item.height + this.drag.translateY;

    this.drag.elem.parentNode.insertBefore( this.drag.elem, insertElem );

    this.$( this.drag.elem ).style( _cssAnimationStyles.transform, `translateY( ${translateY}px )` );

    _forcedSynchronousLayout( this.drag.elem );

    this.$( this.drag.elem ).style( {

      [ _cssAnimationStyles.transition ]: `${_cssAnimationStyles.transform} ${this.options.animateSpeed}ms ease-out`,
      [ _cssAnimationStyles.transform ] : 'translateY( 0px )'

    } );

    this.state.isInserting = true;

  }

  animationCleaner() {

    const dragEndAnimated = () => {

      const removeStyle = {
        [ _cssAnimationStyles.transform ]       : '',
        [ _cssAnimationStyles.transition ]      : '',
        [ _cssAnimationStyles[ 'will-change' ] ]: ''
      };

      const resetItemState = ( elem ) => {

        elem.outViewportTranslateY = '';
        elem.moveAnimated = null;
        elem.endAnimated = null;

      };

      this.drag.elem.classList.remove( this.options.draggingClass );
      this.$( this.drag.elem ).style( removeStyle );

      this.callback( 'onSorted' );

      // Reset of value.
      this.$.elem = null;
      this.drag.elem = null;
      this.drag.siblingElem = null;
      this.state.isInserting = false;
      this.item.collection.map( resetItemState );

    };

    const otherEndAnimated = ( elem ) => {

      if ( elem.hasAttribute( 'style' ) && this.drag.elem !== elem ) {

        const $ = this.$( elem );
        $.if( $.style( _cssAnimationStyles.transform ) !== '' ).style( _cssAnimationStyles.transform, '' )
         .if( $.style( _cssAnimationStyles.transition ) !== '' ).style( _cssAnimationStyles.transition, '' )
         .if( $.style( _cssAnimationStyles[ 'will-change' ] ) !== '' ).style( _cssAnimationStyles[ 'will-change' ], '' );

      }

    };

    // Element of other
    this.item.collection.forEach( otherEndAnimated );
    // Drag element
    _timeLag( this.drag.elem.endAnimated, dragEndAnimated, this.options.animateSpeed + 200 );

  }

  outViewport() {

    const offsetLength = Math.ceil( this.viewport.inElementLength + ( this.viewport.inElementLength / 2 ) );
    let i = this.drag.indexing;
    let j = i;

    if ( this.state.isUp ) {

      i += offsetLength;
      j -= offsetLength - 2;

    } else if ( this.state.isDown ) {

      i -= offsetLength;
      j += offsetLength - 1;

    }

    // Remove style
    if ( i >= 0 && i < this.item.length ) {

      const removeStyleElem = this.item.collection[ i ];
      const translateVal = this.$( removeStyleElem ).style( _cssAnimationStyles.transform );

      if ( translateVal ) {

        if ( this.state.isDown ) {

          i++;

        }

        removeStyleElem.outViewportTranslateY = translateVal;
        this.$( removeStyleElem ).style( _cssAnimationStyles.transform, '' );

      }

    }

    // Add style
    if ( j > 0 && j < this.item.length &&
      this.item.collection[ j ].outViewportTranslateY ) {

      const addStyleElem = this.item.collection[ j - 1 ];
      this.$( addStyleElem ).style( _cssAnimationStyles.transform, this.item.collection[ j ].outViewportTranslateY );

    }

  }

  scrollTo() {

    const OFFSETZONE = 1;
    const moveY = this.drag.moveY;
    const scrollSpeedLevel = this.options.scrollSpeedLevel;
    const offsetTop = Math.max( this.container.top, 0 );
    const offsetBottom = Math.min( this.container.top, window.innerHeight - this.scroll.viewHeight );
    const up = ( OFFSETZONE * scrollSpeedLevel ) - ( ( moveY - offsetTop ) / this.item.height ) * scrollSpeedLevel;
    const down = ( OFFSETZONE * scrollSpeedLevel ) - ( ( ( this.scroll.viewHeight - ( moveY - offsetBottom ) ) / this.item.height ) ) * scrollSpeedLevel;

    if ( up > 0 ) {

      this.scroll.elem.scrollTop -= up;

    } else if ( down > 0 ) {

      this.scroll.elem.scrollTop += this.scrollLimit( down );

    }

    this.scroll.offsetY = this.scroll.elem.scrollTop - this.scroll.originScrollTop;

  }

  scrollLimit( val ) {

    const scrollTop = this.scroll.elem.scrollTop;
    if ( this.scroll.limit <= scrollTop ) {

      return -( scrollTop - this.scroll.limit );

    }

    return val;

  }

  style( props, val ) {

    if ( !this.state.isChainable ) return this;
    switch ( arguments.length ) {

      case 2: {

        this.$.elem.style[ props ] = val;
        return this;

      }

      case 1:
      default: {

        if ( Object.prototype.toString.call( props ) === '[object Object]' ) {

          for ( let prop in props ) {

            if ( Object.prototype.hasOwnProperty.call( props, prop ) ) {

              this.$.elem.style[ prop ] = props[ prop ];

            }

          }

          return this;

        }

        if ( this.$.elem.hasAttribute( 'style' ) && this.$.elem.getAttribute( 'style' ).includes( `${props}:` ) ) {

          return this.$.elem.style[ props ];

        }

        return null;

      }

    }

  }

  callback( name ) {

    if ( typeof this.options[ name ] === 'function' ) {

      this.options[ name ].call(
        this,
        this.drag.elem,
        this.drag.siblingElem,
        this.drag.index,
        this.drag.indexing
      );

    }

  }

}

export default Sortable;
window.Sortable = Sortable;
