//require('../../support');
var Task = require('data.task');
var _ = require('ramda');

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

var Left = function(x) {
  this.__value = x;
};

Left.of = function(x) {
  return new Left(x);
};

Left.prototype.map = function(f) {
  return this;
};

var Right = function(x) {
  this.__value = x;
};

Right.of = function(x) {
  return new Right(x);
};

Right.prototype.map = function(f) {
  return Right.of(f(this.__value));
}

//  either :: (a -> c) -> (b -> c) -> Either a b -> c
var either = _.curry(function(f, g, e) {
  switch (e.constructor) {
    case Left:
      return f(e.__value);
    case Right:
      return g(e.__value);
  }
});

var IO = function(f) {
  this.unsafePerformIO = f;
};

IO.of = function(x) {
  return new IO(function() {
    return x;
  });
}

IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
};

// Exercise 1
// ==========
// Use _.add(x,y) and _.map(f,x) to make a function that increments a value
// inside a functor.

var ex1 = _.map(_.add(1));

ex1(Task.of(1)).fork(console.log, console.log);


// Exercise 2
// ==========
// Use _.head to get the first element of the list.
var xs = Task.of(['do', 'ray', 'me', 'fa', 'so', 'la', 'ti', 'do']);

var ex2 = _.map(_.head)(xs);

ex2.fork(console.log, console.log);


// Exercise 3
// ==========
// Use safeProp and _.head to find the first initial of the user.
var safeProp = _.curry(function(x, o) {
  return Maybe.of(o[x]);
});

var user = {
  id: 2,
  name: 'Albert',
};

var ex3 =_.compose(_.map(_.head), safeProp('name'))(user);

console.log(ex3);


// Exercise 4
// ==========
// Use Maybe to rewrite ex4 without an if statement.

var ex4 = function(n) {
  if (n) {
    return parseInt(n);
  }
};

var ex4 = _.compose(_.map(parseInt),Maybe.of);

console.log(ex4('4'));



// Exercise 5
// ==========
// Write a function that will getPost then toUpperCase the post's title.

// getPost :: Int -> Future({id: Int, title: String})
var getPost = function(i) {
  return new Task(function(rej, res) {
    setTimeout(function() {
      res({
        id: i,
        title: 'Love them futures',
      });
    }, 300);
  });
};

var upperTitle = _.compose(_.toUpper, _.prop('title'));
var ex5 = _.compose(_.map(upperTitle), getPost);

ex5(5).fork(console.log, console.log);


// Exercise 6
// ==========
// Write a function that uses checkActive() and showWelcome() to grant access
// or return the error.

var showWelcome = _.compose(_.concat( "Welcome "), _.prop('name'));

var checkActive = function(user) {
  return user.active ? Right.of(user) : Left.of('Your account is not active');
};

var ex6 = _.compose(_.map(showWelcome), checkActive);

console.log(ex6({active: 0, name: 'bar'}));


// Exercise 7
// ==========
// Write a validation function that checks for a length > 3. It should return
// Right(x) if it is greater than 3 and Left("You need > 3") otherwise.

var ex7 = function(x) {
  return x.length > 3 ? Right.of(x) : Left.of('You need > 3');
};

console.log(ex7('abc'));


// Exercise 8
// ==========
// Use ex7 above and Either as a functor to save the user if they are valid or
// return the error message string. Remember either's two arguments must return
// the same type.

var save = function(x) {
  return new IO(function() {
    console.log('SAVED USER!');
    return x + '-saved';
  });
};

var ex8 = _.compose(either(IO.of, save), ex7);

ex8('abcd').unsafePerformIO();
