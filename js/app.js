require([
  'jquery',
  'lib/renewal'
], function ($, Renewal) {

  var
    slideshow = $('#slideshow'),
    demoElement = slideshow.find('.carousel'),
    carousel = new Renewal(demoElement, {
      speed: 500,
      visible: 3
    }),
    prev = slideshow.find('.prev'),
    next = slideshow.find('.next'),
    maxPosition = carousel.length - carousel.getConfig().visible;

    prev.on('click', function () {
      carousel.reverse(1);
    });

    next.on('click', function () {
      if (carousel.getPosition() < maxPosition) {
        carousel.advance(1);
      }
    });

});
