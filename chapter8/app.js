var _ = require('ramda');
var Task = require('data.task');
var fs = require('fs');

var Container = function(x) {
  this.__value = x;
}

Container.of = function(x) { return new Container(x); };

console.log(Container.of(3));
console.log(Container.of(Container.of({
  name: 'yoda',
})));

// (a -> b) -> Container a -> Container b
Container.prototype.map = function(f) {
  return Container.of(f(this.__value));
}

console.log(Container.of("bombs").map(_.concat(' away')).map(_.prop('length')));
console.log(_.map(_.compose(_.prop('length'), _.concat(' away')))(Container.of("bombs")));

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
};

// Postgres.connect :: Url -> IO String

var Postgres = {};
Postgres.connect = function(url) {
  return new IO(function() {
    console.log('asfsada');
    return url + '***';
  });
}

// runQuery :: String -> String

var runQuery = function(x) {
  return x + '111';
}

//  readFile :: String -> Task Error String
var readFile = function(filename) {
  return new Task(function(reject, result) {
    fs.readFile(filename, 'utf-8', function(err, data) {
      err ? reject(err) : result(data);
    });
  });
};

// Pure application
//=====================

//  dbUrl :: Config -> Either Error Url
var dbUrl = function(c) {
  return (c.uname && c.pass && c.host && c.db)
    ? Right.of('db:pg://'+c.uname+':'+c.pass+'@'+c.host+'5432/'+c.db)
    : Left.of(Error('Invalid config!'));
}

//  connectDb :: Config -> Either Error (IO DbConnection)
var connectDb = _.compose(_.map(Postgres.connect), dbUrl);

//  getConfig :: Filename -> Task Error (Either Error (IO DbConnection))
var getConfig = _.compose(_.map(_.compose(connectDb, JSON.parse)), readFile);

//  either :: (a -> c) -> (b -> c) -> Either a b -> c
var either = _.curry(function(f, g, e) {
  switch (e.constructor) {
    case Left:
      return f(e.__value);
    case Right:
      return g(e.__value);
  }
});


// Impure calling code
//=====================
getConfig('chapter8/db.json').fork(
  console.log, either(console.log, function(x) {
    x.__value();
  })
);
