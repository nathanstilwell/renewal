define([
  'jquery'
], function ($) {
  var proto;

  function Renewal (element, options) {
    var
      VERSION = '0.1.0',
      defaults = {

      },
      self = this;

    /* private methods */
    function private () {

    }

    //
    //  public api
    //
    this.version = VERSION;


  } // Renewal

  proto = Renewal.prototype;

  proto.size = function size () {
    return this.size;
  };

  return Renewal;

});
