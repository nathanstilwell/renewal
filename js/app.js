require([
  'jquery',
  'lib/renewal'
], function ($, Renewal) {

  var
    demoElement = $('#demo-carousel'),
    demo = new Renewal(demoElement, {
      speed: 500,
      visible: 3
    });

    $('#prev').on('click', function () {
      demo.reverse();
    });

    $('#next').on('click', function () {
      demo.advance();
    });

});
