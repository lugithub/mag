var Task = require('data.task');
var _ = require('ramda');
const { add, curry } = _;

// fib browser for test
var localStorage = {};

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
  return this.isNothing() ?  Maybe.of(null) : other_container.map(this.__value);
}

var liftA2 = curry(function(f, functor1, functor2) {
  return functor1.map(f).ap(functor2);
});

var getPost = function(i) {
  return new Task(function(rej, res) {
    setTimeout(function() {
      res({
        id: i,
        title: 'Love them tasks',
      });
    }, 300);
  });
};

var getComments = function(i) {
  return new Task(function(rej, res) {
    setTimeout(function() {
      res([{
        post_id: i,
        body: 'This book should be illegal',
      }, {
        post_id: i,
        body: 'Monads are like smelly shallots',
      }]);
    }, 300);
  });
};

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

// Exercise 1
// ==========
// Write a function that adds two possibly null numbers together using Maybe and ap().

//  ex1 :: Number -> Number -> Maybe Number
var ex1 = function(x, y) {
  return Maybe.of(add).ap(Maybe.of(x)).ap(Maybe.of(y));
};

console.log(ex1(null, 3));

// Exercise 2
// ==========
// Now write a function that takes 2 Maybe's and adds them. Use liftA2 instead of ap().

//  ex2 :: Maybe Number -> Maybe Number -> Maybe Number
var ex2 = function(m1, m2) {
  return liftA2(add, m1, m2);
}

console.log(ex2(Maybe.of(null), Maybe.of(3)));

// Exercise 3
// ==========
// Run both getPost(n) and getComments(n) then render the page with both. (The n arg is arbitrary.)
var makeComments = _.reduce(function(acc, c) { return acc+"<li>"+c+"</li>" }, "");
var render = _.curry(function(p, cs) { return "<div>"+p.title+"</div>"+makeComments(cs); });

//  ex3 :: Task Error HTML
var ex3 =  n => liftA2(render, getPost(n), getComments(n));

ex3(1).fork(console.log, console.log);


// Exercise 4
// ==========
// Write an IO that gets both player1 and player2 from the cache and starts the game.
localStorage.player1 = "toby";
localStorage.player2 = "sally";

var getCache = function(x) {
  return new IO(function() { return localStorage[x]; });
};
var game = _.curry(function(p1, p2) { return p1 + ' vs ' + p2; });

//  ex4 :: IO String
var ex4 = liftA2(game, getCache('player1'), getCache('player2'));

console.log(ex4.unsafePerformIO());
