# Renewal

Last Day. Capricorn 15's. Year of the city - 2274. Carousel begins

This is the non-jquery-plugin version of [Mark Wunch](https://github.com/mwunsch)'s [jquery-renewal](https://github.com/mwunsch/jquery-renewal).

![](http://uprightnetizen.com/img/carrousel.jpg)

## Use:

Markup structure

  .a_wrapper
    .the_carousel
      .child
      .child
      .child
      .child
      … etc

JavaScript

    var carousel = new Renewal($('.the_carousel');


### Under the Hood

Renewal will add the following styles:

    .a_wrapper {
      overflow-x: hidden;
      width: (width of children shown, default is 1);
      left: 0px;
    }

    .the_carousel {
      position: relative;
      width: (total width of children);
      left: 0;
    }

### API

    var carousel = new Renewal($('.the_carousel'));

`carousel` is a Renewal object and you can call methods on it:

    carousel.size()
    //  How many elements are in the carousel
    carousel.getPosition()
    //  What is the current position of the carousel (0 indexed)
    carousel.getCurrentItem()
    //  Get the jQuery element at the current position
    carousel.getConfig()
    //  Get the configuration for this particular carousel
    carousel.advance([step])
    //  Advance the carousel
    carousel.reverse([step])
    //  Move backwards through the carousel
    carousel.moveTo(position, [speed, easing])
    //  Lower level method to move to a certain position in the carousel

Beyond calling the methods on the Renewal object itself, you have access to some events:

    'renewal.advance'
      Triggering will call Renewal#advance
    'renewal.reverse'
      Triggering will call Renewal#reverse
    'renewal.move'
      This is triggered in the call to Renewal#moveTo
    'renewal.moving'
      This is triggered before the carousel begins moving
    'renewal.moved'
      This is triggered after the carousel has finished it's movement

## Configuration

jquery-renewal has a few defaults. Overwrite them simply:

    $('.carousel').renewal({
      accessor: 'carousel',                      // The key to access the Renewal object on the element
      easing: null,                              // String name of an easing function
      eventAdvance: 'renewal.advance',           // The event for advancement
      eventMove: 'renewal.move',                 // The event for movement
      eventReverse: 'renewal.reverse',           // The event for reversal
      preferCSSTransform: false,                 // The animation method, either using $.fn.animate of CSS transform
      speed: 150,                                // The duration of animation
      start: 0,                                  // The starting position of the carousel
      visible: 1,                                // How many elements should be visible at one time
      wrapperClass: 'renewal-carousel-container' // The class name given to the wrapper
    });

If `visible` is falsy, the width of the wrapper (`$('.a_wrapper')`), is not affected at all.

If `preferCSSTransform` is true, Renewal will set `transform: translateX(some px)` instead of running jQuery Animate.
To take advantage of this performance enhancement, you should add CSS tranistions on your carousel element. For example:

    .the_carousel {
      -webkit-transition: -webkit-transform .5s ease;
      -moz-transition: -moz-transform .5s ease;
      -ms-transition: -ms-transform .5s ease;
      -o-transition: -o-transform .5s ease;
      transition: transform .5s ease;
    }

