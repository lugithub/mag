var fs = require('fs');
var _ = require('ramda');
const { curry, compose, map, add } = _;
var Task = require('data.task');

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

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
}

Maybe.prototype.ap = function(other_container) {
  return other_container.map(this.__value);
}

IO = function(f) {
  this.unsafePerformIO = f;
}

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
}

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
}

IO.prototype.join = function() {
  return this.unsafePerformIO();
}

IO.prototype.chain = function(f) {
  return this.map(f).join();
}

IO.prototype.ap = function(a) {
  return this.chain(function(f) {
    return a.map(f);
  });
}

IO.prototype.inspect = function() {
  return 'IO('+inspect(this.unsafePerformIO)+')';
}


console.log(Maybe.of(add).ap(Maybe.of(2)).ap(Maybe.of(3)));

// Http.get :: String -> Task Error HTML
var Http = {
  get: function(url) {
    return new Task(function(rej, res) {
      res(url);
    })
  }
};

var renderPage = curry(function(destinations, events) {
  return `${destinations} ${events}`;
});

var a = Task.of(renderPage).ap(Http.get('/destinations')).ap(Http.get('/events'))
// Task("<div>some page with dest and events</div>")
a.fork(console.log, console.log);

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
  return {
    username,
    password,
    remember_me
  };
  /* signing in */
});

const b = IO.of(signIn).ap(getVal('#email')).ap(getVal('#password')).ap(IO.of(false));
console.log(b.unsafePerformIO());


// IO({id: 3, email: "gg@allin.com"})
