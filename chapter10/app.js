var fs = require('fs');
var _ = require('ramda');
const { curry, compose, map } = _;

var IO = function(f) {
  this.unsafePerformIO = f;
};

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
};

IO.prototype.join = function() {
  var thiz = this;
  return new IO(function() {
    return thiz.unsafePerformIO().unsafePerformIO();
  });
}

IO.of = function(f) {
  return new IO(f);
};

IO.prototype.ap = function(other_container) {
  return other_container.map(this.unsafePerformIO);
};

// Helpers:
// ==============
//  $ :: String -> IO DOM
var $ = function(selector) {
  return new IO(function() { return {
      value: selector
    };
  });
}

//  getVal :: String -> IO String
var getVal = compose(map(_.prop('value')), $);

// Example:
// ===============
//  signIn :: String -> String -> Bool -> User
var signIn = curry(function(username, password, remember_me) {
  console.log(username, password, remember_me);
  /* signing in */
});

const x = IO.of(signIn).ap(getVal('#email')).ap(getVal('#password')).ap(IO.of(() => false));
console.log(x.unsafePerformIO());

// IO({id: 3, email: "gg@allin.com"})
