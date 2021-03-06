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
      VERSION = '0.1.2',
      elem = $(element),
      defaults = {
        accessor: 'carousel',
        easing: null,
        eventAdvance:    'renewal.advance',
        eventAfterMove:  'renewal.moved',
        eventBeforeMove: 'renewal.moving',
        eventMove:       'renewal.move',
        eventReverse:    'renewal.reverse',
        preferCSSTransform: false,
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
      // feature detection
      transitionEvent = [
        'webkitTransitionEnd',
        'mozTransitionEnd',
        'oTransitionEnd',
        'msTransitionEnd',
        'transitionend'
      ].join(' '),
      featureTestElement = document.createElement('i'),
      transform = (typeof featureTestElement.style.transform !== 'undefined') && 'transform' ||
                  (typeof featureTestElement.style.webkitTransform !== 'undefined') && 'webkitTransform' ||
                  (typeof featureTestElement.style.MozTransform !== 'undefined') && 'MozTranform' ||
                  (typeof featureTestElement.style.OTransform !== 'undefined') && 'OTransform' ||
                  (typeof featureTestElement.style.msTransform !== 'undefined') && 'msTransform',
      _moveTo;

    //
    //  Private Methods
    //

    function translateX (position) {
      var
        style = {},
        transitionDuration = null,
        deferred = $.Deferred();

      if (window.getComputedStyle) {
        transitionDuration = window.getComputedStyle(elem.get(0)).transitionDuration;
      }

      style[transform] = 'translateX(' + -getResidentsWidth(position) + 'px)';
      elem.css(style);
      if (transitionDuration) {
        elem.one(transitionEvent, function () {
          deferred.resolve();
        });
      }

      return deferred.promise();
    }

    function jsAnimate (position, speed, easing) {
      var
        style = {},
        deferred = $.Deferred(),
        returnValue = null;

      style.left = '-' + getResidentsWidth(position) + 'px';
      if (opts.speed) {
        elem.animate(style, speed, easing, function () {
          deferred.resolve();
        });
        returnValue = deferred.promise();
      } else {
        elem.css(style);
      }

      return returnValue;
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

    //
    // Initialize the Carousel
    //


    elem.css({
      'position' : 'relative',
      'width' : getResidentsWidth()
    });

    if (opts.preferCSSTransform && transform) {
      _moveTo = translateX;
      elem.get(0).style[transform] = 'translateX(' + -getResidentsWidth(Math.abs(opts.start)) + 'px)';
    } else {
      _moveTo = jsAnimate;
      elem.css('left', -getResidentsWidth(Math.abs(opts.start)));
    }

      // 'left' : -getResidentsWidth(Math.abs(opts.start))

    wrapper.addClass(opts.wrapperClass);
    wrapper.css('overflow-x', 'hidden');

    if (opts.visible) {
      wrapper.css('width', getResidentsWidth(opts.visible));
    }

    elem.bind(opts.eventAdvance, function () {
      self.advance();
    });

    elem.bind(opts.eventReverse, function () {
      self.reverse();
    });

    elem.on(opts.eventMove, function (position, speed, easing) {
      self.moveTo(position, speed, easing);
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
     * @param   {Number}  s         jQuery animation speed for transition
     * @param   {String}  e         Named jQuery easing function
     */
    this.moveTo = function moveTo (position, s, e) {
      var
        promise,
        speed = (typeof s === "undefined") ? opts.speed : s,
        easing = (typeof e === "undefined") ? opts.easing : e;

      if (position >= 0 && position < self.length) {
        elem.trigger(opts.eventBeforeMove);
        currentPosition = position;

        promise = _moveTo(position, speed, easing);

        if (typeof promise === "object") {
          promise.then(function moveToPromiseResolved () {
            elem.trigger(opts.eventAfterMove);
          });
        } else {
          elem.trigger(opts.eventAfterMove);
        }
      }

      return self;
    };

    /**
     * Get the current position of the carousel
     *
     * @method  getPosition
     * @public
     *
     * @return  {Number} Current position of carousel
     */
    this.getPosition = function getPosition() {
      return currentPosition;
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

  return Renewal;
}));
