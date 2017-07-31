var _ = require('ramda');

////// Our pure library: lib/params.js ///////
var Maybe = function(x) {
  this.__value = x;
};

Maybe.of = function(x) {
  return new Maybe(x);
};

Maybe.prototype.isNothing = function() {
  return (this.__value === null || this.__value === undefined);
};

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this.__value));
};

var IO = function(f) {
  this.__value = f;
};

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
};

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.__value));
};

//  url :: IO String
var url = new IO(function() {
  global.href = '&searchTerm=wafflehouse&a=1';
  return global.href;
});

//  toPairs ::  String -> [[String]]
var toPairs = _.compose(_.map(_.split('=')), _.split('&'));

//  params :: String -> [[String]]
var params = _.compose(toPairs, _.last, _.split('?'));

//  findParam :: String -> IO Maybe [String]
var findParam = function(key) {
  return _.map(_.compose(Maybe.of, _.filter(_.compose(_.equals(key), _.head)), params), url);
};

////// Impure calling code: main.js ///////

// run it by calling __value()!
console.log(findParam("searchTerm").__value());
// Maybe([['searchTerm', 'wafflehouse']])
