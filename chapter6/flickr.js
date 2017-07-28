requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  },
});

require([
    'ramda',
    'jquery',
  ],
  function(_, $) {
    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });
    // app goes here

    var Impure = {
      getJSON: _.curry(function(callback, url) {
        $.getJSON(url, callback);
      }),

      setHtml: _.curry(function(sel, html) {
        $(sel).html(html);
      })
    };

    var url = function(term) {
      return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
      term + '&format=json&jsoncallback=?';
    };

    var prop = _.curry(function(property, object) {
      return object[property];
    });

    var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

    var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

    var img = function(url) {
      return $('<img />', {
        src: url
      });
    };

    //var images = _.compose(_.map(img), srcs);

    //inline srcs
    //var images = _.compose(_.map(img), _.compose(_.map(mediaUrl), _.prop('items')));

    //remove extra compose
    //var images = _.compose(_.map(img), _.map(mediaUrl), _.prop('items'));

    //remove extra map
    //var images = _.compose(_.map(_.compose(img, mediaUrl)), _.prop('items'));

    //extract function out
    var mediaToImg = _.compose(img, mediaUrl);
    var images = _.compose(_.map(mediaToImg), _.prop('items'));

    var renderImages = _.compose(Impure.setHtml('body'), trace('srcs'), images);
    var app = _.compose(Impure.getJSON(renderImages), url);

    app('cats');
  });
