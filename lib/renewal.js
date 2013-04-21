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

var Renewal = (function(root, factory) {
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
      self = this;

    //
    //  Private Methods
    //

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
        cssMarginLeft,
        marginLeft,
        cssMarginRight,
        marginRight;

      cssMarginLeft = el.css('marginLeft');
      cssMarginRight = el.css('marginRight');
      marginLeft = (cssMarginLeft !== 'auto') ? parseInt(cssMarginLeft, 10) : 0;
      marginRight = (cssMarginRight !== 'auto') ? parseInt(cssMarginRight, 10) : 0;

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
      'width' : getResidentsWidth(),
      'left' : -getResidentsWidth(Math.abs(opts.start))
    });

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
    this.moveTo = function moveTo (position, speed, easing) {
      var
        style = {},
        duration = speed != null ? speed : opts.speed;

      if (position >= 0 && position < self.length) {
        currentPosition = position;
        style.left = '-' + getResidentsWidth(position) + 'px';
        elem.trigger(opts.eventBeforeMove);
        if (duration) {
          elem.animate(style, duration, easing || opts.easing);
        } else {
          elem.css(style);
        }
        elem.trigger(opts.eventMove);
        elem.trigger(opts.eventAfterMove);
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

  // AMD define happens at the end for compatibility with AMD loaders
  // that don't enforce next-turn semantics on modules.
  if (typeof define === 'function' && define.amd) {
    define('renewal', [], function() {
      return Renewal;
    });
  }

  return Renewal;
}));
