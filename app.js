var _ = require('ramda');


// Exercise 1
//==============
// Refactor to remove all arguments by partially applying the function.

// var words = function(str) {
//   return _.split(' ', str);
// };

//Most of the functions offered by the ramda library are curried by default.
var words = _.split(' ');

console.log(words('hi foo bar'));

// Exercise 1a
//==============
// Use map to make a new words fn that works on an array of strings.

var map = _.curry(function(f, ary) {
  return ary.map(f);
});

var wordsOnArray = map(words);

console.log(wordsOnArray(['hi foo bar', 'you super']))


// Exercise 2
//==============
// Refactor to remove all arguments by partially applying the functions.

var match = _.curry(function(what, str) {
  return str.match(what);
});

var filterQs = function(xs) {
  return _.filter(function(x) {
    return match(/q/i, x);
  }, xs);
};

var filterQs = _.filter(match(/q/i));

console.log(filterQs(['hi foo bar', 'you super q', ]))


// Exercise 3
//==============
// Use the helper function _keepHighest to refactor max to not reference any
// arguments.

// LEAVE BE:
var _keepHighest = function(x, y) {
  return x >= y ? x : y;
};

// REFACTOR THIS ONE:
var max = function(xs) {
  return _.reduce(function(acc, x) {
    return _keepHighest(acc, x);
  }, -Infinity, xs);
};

var max = _.reduce(_keepHighest, -Infinity);

console.log(max([1,2,3]))

// Bonus 1:
// ============
// Wrap array's slice to be functional and curried.
// //[1, 2, 3].slice(0, 2)
var slice = _.curry(function(beginIndex, endIndex, xs) {
  return xs.slice(beginIndex, endIndex);
});

console.log(slice(0, 2)([1, 2, 3]))

// Bonus 2:
// ============
// Use slice to define a function "take" that returns n elements from the beginning of an array. Make it curried.
// For ['a', 'b', 'c'] with n=2 it should return ['a', 'b'].
var take = slice(0);

console.log(take(3)(['a', 'b', 'c']))
