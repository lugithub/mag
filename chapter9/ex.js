var _ = require('ramda');
const { curry, compose, map } = _;
var fs = require('fs');
var path = require('path');
var Task = require('data.task');

//  chain :: Monad m => (a -> m b) -> m a -> m b
var chain = curry(function(f, m){
  return m.map(f).join(); // or compose(join, map(f))(m)
});

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

Maybe.prototype.chain = function(f) { return this.map(f).join(); }

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

var either = curry(function(f, g, e) {
  switch (e.constructor) {
    case Left:
      return f(e.__value);
    case Right:
      return g(e.__value);
  }
});

split = curry(function(what, x) {
    return x.split(what);
});

// Exercise 1
// ==========
// Use safeProp and map/join or chain to safely get the street name when given
// a user.

var safeProp = _.curry(function(x, o) {
  return Maybe.of(o[x]);
});
var user = {
  id: 2,
  name: 'albert',
  address: {
    street: {
      number: 22,
      name: 'Walnut St',
    },
  },
};

var ex1 = compose(chain(safeProp('name')), chain(safeProp('street')), safeProp('address'));
console.log(ex1(user));


// Exercise 2
// ==========
// Use getFile to get the filename, remove the directory so it's just the file,
// then purely log it.

var getFile = function() {
  return new IO(function() {
    return __filename;
  });
};

var pureLog = function(x) {
  return new IO(function() {
    console.log(x);
    return 'logged ' + x;
  });
};

var ex2 = compose(chain(compose(pureLog, _.last, split(path.sep))), getFile);
console.log(ex2().unsafePerformIO());


// Exercise 3
// ==========
// Use getPost() then pass the post's id to getComments().
//
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


var ex3 = compose(_.chain(compose(getComments, _.prop('id'))), getPost)(1);
ex3.fork(console.log, console.log);


// Exercise 4
// ==========
// Use validateEmail, addToMailingList, and emailBlast to implement ex4's type
// signature.

//  addToMailingList :: Email -> IO([Email])
var addToMailingList = (function(list) {
  return function(email) {
    return new IO(function() {
      list.push(email);
      return list;
    });
  };
})([]);

function emailBlast(list) {
  return new IO(function() {
    return 'emailed: ' + list.join(',');
  });
}

var validateEmail = function(x) {
  return x.match(/\S+@\S+\.\S+/) ? (new Right(x)) : (new Left('invalid email'));
};

//  ex4 :: Email -> Either String (IO String)
var ex4 = compose(map(compose(chain(emailBlast), addToMailingList)), validateEmail);
either(console.log, function(m) {
  console.log(m.unsafePerformIO());
})(ex4('foo'));
either(console.log, function(m) {
  console.log(m.unsafePerformIO());
})(ex4('foo@bar.com'));
