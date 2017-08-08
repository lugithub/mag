// Support
// ===========================
var fs = require('fs');
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

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this.__value;
}

var IO = function(f) {
  this.unsafePerformIO = f;
};

// this.unsafePerformIO is function() {
//  return fs.readFileSync(filename, 'utf-8');
//}
//
// f is print
//
IO.prototype.map = function(f) {
  return new IO(_.compose(f, this.unsafePerformIO));
};

//  readFile :: String -> IO String
var readFile = function(filename) {
  return new IO(function() {
    return fs.readFileSync(filename, 'utf-8');
  });
};

//  print :: String -> IO String
var print = function(x) {
  return new IO(function() {
    console.log(x);
    return x;
  });
};

// Example
// ===========================
//  cat :: String -> IO (IO String)
var cat = _.compose(_.map(print), readFile);

console.log(cat('.git/config').unsafePerformIO().unsafePerformIO());

//  catFirstChar :: String -> IO (IO String)
var catFirstChar = _.compose(_.map(_.map(_.head)), cat);

console.log(catFirstChar(".git/config").unsafePerformIO().unsafePerformIO());


//  safeProp :: Key -> {Key: a} -> Maybe a
var safeProp = _.curry(function(x, obj) {
  return new Maybe(obj[x]);
});

//  safeHead :: [a] -> Maybe a
var safeHead = safeProp(0);

//  firstAddressStreet :: User -> Maybe (Maybe (Maybe Street) )
var firstAddressStreet = _.compose(
  _.map(_.map(safeProp('street'))), _.map(safeHead), safeProp('addresses')
);

var x = firstAddressStreet({
  addresses: [{
    street: {
      name: 'Mulburry',
      number: 8402,
    },
    postcode: 'WC2N',
  }],
})
console.log(x);
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))

_.map(_.map(_.map(console.log)))(x);


//  join :: Monad m => m (m a) -> m a
var join = function(mma) {
  return mma.join();
};

//  firstAddressStreet :: User -> Maybe Street
var firstAddressStreet = _.compose(
  join, _.map(safeProp('street')), join, _.map(safeHead), safeProp('addresses')
);

var x = firstAddressStreet({
  addresses: [{
    street: {
      name: 'Mulburry',
      number: 8402,
    },
    postcode: 'WC2N',
  }],
});
// Maybe({name: 'Mulburry', number: 8402})

_.map(console.log)(x);
