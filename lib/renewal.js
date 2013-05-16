/*jshint eqnull: true, browser: true */
/*global define: false */

/**
 *
 * Renewal
 *
 * A jquery based carousel that makes few assumptions and few modifications
 * to the DOM. It also makes reference to Logan's run.
 *
 * @requires jquery
 * @module renewal
 *
 * Copyright (c) 2011 Mark Wunsch (markwunsh.com)
 * Reinterpreted by Nathan Stilwell (nathanstilwell.github.com), 2013
 * https://github.com/nathanstilwell/renewal
 *
 * Licensed under the Apache License
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    root.Renewal = factory(root.$);
  }
}(this, function ($) {
  // assume we have jQuery
  var proto;

  /**
   * Constructs a new instance of Renewal
   *
   * @method   Renewal
   * @public
   * @constructor
   *
   * @param    {Object} element    The DOM element that will become a carousel
   * @param    {Object} [options]  A Object literal of options
   */
  function Renewal (element, options) {
    var
      VERSION = '0.1.0',
      elem = $(element),
      defaults = {
        accessor: 'carousel',
        easing: null,
        eventAdvance:    'renewal.advance',
        eventAfterMove:  'renewal.moved',
        eventBeforeMove: 'renewal.moving',
        eventMove:       'renewal.move',
        eventReverse:    'renewal.reverse',
        transition: 'slide',
        speed: 150,
        start: 0,
        vertical: false,
        visible: 1,
        wrapperClass: 'renewal-carousel-container'
      },
      /*
       *  Residents are the members of the carousel
       *
       * @property residents
       * @private
       */
      residents = elem.children(),
      wrapper = elem.parent(),
      opts = $.extend({}, defaults, options),
      currentPosition = Math.abs(opts.start) || 0,
      self = this,
      // feature detects
      transform = null,
      // private functions set by feature detection
      _moveTo;


    // function slideToPositionLeft (position) {
    //   var style = {};
    //   style.left = '-' + getResidentsWidth(position) + 'px';
    //   elem.css(style);
    // }

    function slideToTranslateX (position) {
      var
        style = {},
        transitionEvent = [
        'webkitTransitionEnd',
        'mozTransitionEnd',
        'oTransitionEnd',
        'msTransitionEnd',
        'transitionend'
      ].join(' '),
      deferred = $.Deferred();

      style[transform] = 'translateX(' + -getResidentsWidth(position) + 'px)';
      elem.css(style);
      // what if there's no transition
      elem.one(transitionEvent, function () {
        deferred.resolve();
      });

      return deferred.promise();
    }

    function slideToJsAnimate (position) {
      var
        style = {},
        deferred = $.Deferred(),
        returnValue = null;

      style.left = '-' + getResidentsWidth(position) + 'px';
      if (opts.speed) {
        elem.animate(style, opts.speed, opts.easing, function () {
          deferred.resolve();
        });
        returnValue = deferred.promise();
      } else {
        elem.css(style);
      }

      return returnValue;
    }

    function activateSlide (position) {
      elem.trigger(opts.eventBeforeMove);
      currentPosition = position;

      residents.removeClass('active');
      residents.filter(':nth-child(' + (position + 1) + ')').addClass('active');

      elem.trigger(opts.eventAfterMove);
    }


    /**
     * Calculates the width of a given element
     *
     * @method  calculateElementWidth
     * @private
     *
     * @param  {Object} el A jQuery object of the element to be calculated
     *
     * @return  Width of the element in pixels
     */
    function calculateElementWidth(el) {
      var
        marginLeft = parseInt(el.css('marginLeft'), 10) || 0,
        marginRight = parseInt(el.css('marginRight'), 10) || 0;

      return el.outerWidth() + marginLeft + marginRight;
    }

    /**
     * Calculates the width of a number of residents of the carousel. If upTo
     *  is undefined, returns the width of all the combined residents
     *
     * @method  getResidentsWidth
     * @private
     *
     * @param {Number} [upTo] A number of residents to count up to
     *
     * @return  width of residents
     */
    function getResidentsWidth(upTo) {
      var width = 0;
      residents.each(function (i, el) {
        if ((!upTo && upTo !== 0) || upTo >= i + 1) {
          width += calculateElementWidth($(el));
        }
      });
      return width;
    }

    function slideInit () {
      var i = document.createElement('i');
      transform = (typeof i.style.transform !== 'undefined') && 'transform' ||
                  (typeof i.style.webkitTransform !== 'undefined') && 'webkitTransform' ||
                  (typeof i.style.MozTransform !== 'undefined') && 'MozTranform' ||
                  (typeof i.style.OTransform !== 'undefined') && 'OTransform' ||
                  (typeof i.style.msTransform !== 'undefined') && 'msTransform';

      elem.css({
        'position' : 'relative',
        'width' : getResidentsWidth()
      });

      if (transform !== null) {
        var translateProp = 'translateX(' + -getResidentsWidth(Math.abs(opts.start)) +'px)';
        elem.css(transform, translateProp);
      }

      wrapper.css('overflow-x', 'hidden');

      if (opts.visible) {
        wrapper.css('width', getResidentsWidth(opts.visible));
      }

      // define moving function
      if (transform !== null) {
        _moveTo = slideToTranslateX;
      } else {
        _moveTo = slideToJsAnimate;
      }
    }

    function activeInit () {
      residents.first().addClass('active');
      _moveTo = activateSlide;
    }

    //
    // Initialize the Carousel
    //

    wrapper.addClass(opts.wrapperClass);

    if (opts.transition === 'slide') {
      slideInit();
    }

    if (opts.transition === 'active') {
      activeInit();
    }

    elem.bind(opts.eventAdvance, function () {
      self.advance();
    });

    elem.bind(opts.eventReverse, function () {
      self.reverse();
    });

    //
    //  public api
    //
    this.version = VERSION;
    this.length = residents.size();

    /**
     * Move the carousel to the given position
     *
     * @method  moveTo
     * @public
     *
     * @param   {Number}  position  Position to move to in the carousel
     * @param   {Number}  speed     jQuery animation speed for transition
     * @param   {String}  easing    Named jQuery easing function
     */
    this.moveTo = function moveTo (position) {
      var promise;

      if (position >= 0 && position < self.length) {
        elem.trigger(opts.eventBeforeMove);
        currentPosition = position;

        elem.trigger(opts.eventMove);
        promise = _moveTo(position);

        if (typeof promise === "object") {
          elem.trigger(opts.eventAfterMove);
        } else {
          elem.trigger(opts.eventAfterMove);
        }
      }

      return self;
    };
    /**
     * Get the item currently at the front of the carousel
     *
     * @method  getCurrentItem
     * @public
     *
     * @return  {Object} a jQuery object with the current carousel item
     */
    this.getCurrentItem = function getCurrentItem() {
      return residents.eq(currentPosition);
    };

    this.getPosition = function getPosition () {
      return currentPosition;
    };

    this.setPosition = function setPosition (position) {
      this.currentPosition = position;
      return true;
    };

    /**
     * Get the current set of configuration options
     *
     * @method  getConfig
     * @public
     *
     * @return  {Object}  An object with the current configuration options
     */
    this.getConfig = function getConfig() {
      return opts;
    };
  } // Renewal

  proto = Renewal.prototype;

  /**
   * Returns the current number of residents in the carousel
   *
   * @property  size
   * @public
   *
   * @return  {Number}  Number of resident in the carousel
   */
  proto.size = function size () {
    return this.length;
  };

  /**
   * Get the current position of the carousel
   *
   * @method  getPosition
   * @public
   *
   * @return  {Number} Current position of carousel
   */
  proto.getPosition = function getPosition() {
    return this.getPosition();
  };

  proto._setPosition = function setPosition (position) {
    return this.setPosition(position);
  };
  /**
   * Advance the carousel a certain number of steps. If no steps are given,
   *  advance one step.
   *
   * @method  advance
   * @public
   *
   * @param  {Number}  [steps]   Number of steps to advance
   */
  proto.advance = function advance(steps) {
    var pos = this.getPosition(),
        config = this.getConfig(),
        st = steps ? steps : config.visible || 1,
        nextPosition = pos + st;
    if (st >= this.length) {
      nextPosition = this.length - 1;
    }
    this.moveTo(nextPosition < 0 ? 0 : nextPosition);
    return this;
  };
  /**
   * Reverse the carousel a certain number of steps. If no steps are given,
   *  reverse one step.
   *
   * @method  reverse
   * @public
   *
   * @param  {Number}  [steps]  Number of steps to reverse
   */
  proto.reverse = function reverse(steps) {
    var pos = this.getPosition(),
        config = this.getConfig(),
        st = steps ? steps : config.visible || 1,
        previousPosition = pos - st;
    if (previousPosition >= this.length) {
      previousPosition = this.length - 1;
    }
    this.moveTo(previousPosition < 0 ? 0 : previousPosition);
    return this;
  };

  // AMD define happens at the end for compatibility with AMD loaders
  // that don't enforce next-turn semantics on modules.
  if (typeof define === 'function' && define.amd) {
    define('renewal', [], function() {
      return Renewal;
    });
  }

  return Renewal;
}));
