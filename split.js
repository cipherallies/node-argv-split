'use strict';

var _CHARS;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = split;
// split.join = join


// Flags                        Characters
//             0         1         2         3         4         5
// ------------------------------------------------------------------------
//             \         '         "         normal    space     \n
//   e,sq      n/a       n/a       n/a       n/a       n/a       n/a
// 0 ue,sq     a \       suq       a "       a +       a _       EOF
// 1 e,dq      a \,ue    a \',ue   a ",ue    a \+,ue   a \_,ue   ue
// 2 ue,dq     e         a '       duq       a +       a _       EOF
// 3 e,uq      a \,ue    a \',ue   a \",ue   a \+,ue   a _,ue    ue
// 4 ue,uq     e         sq        dq        a +       tp        EOF

var MATRIX = {
  // object is more readable than multi-dim array.
  0: [a, suq, a, a, a, EOF],
  1: [eaue, aue, eaue, aue, aue, ue],
  2: [e, a, duq, a, a, EOF],
  3: [eaue, aue, aue, aue, eaue, ue],
  4: [e, sq, dq, a, tp, EOF]
};

// - a: add
// - e: turn on escape mode
// - ue: turn off escape mode
// - q: turn on quote mode
//   - sq: single quoted
//   - dq: double quoted
// - uq: turn off quote mode
// - tp: try to push if there is something in the stash
// - EOF: end of file(input)

var escaped = false; // 1
var single_quoted = false; // 2
var double_quoted = false; // 4
var ended = false;

var FLAGS = {
  2: 0,
  5: 1,
  4: 2,
  1: 3,
  0: 4
};

function y() {
  var sum = 0;

  if (escaped) {
    sum++;
  }

  if (single_quoted) {
    sum += 2;
  }

  if (double_quoted) {
    sum += 4;
  }

  return FLAGS[sum];
}

var BACK_SLASH = '\\';
var SINGLE_QUOTE = "'";
var DOUBLE_QUOTE = '"';
var WHITE_SPACE = ' ';
var CARRIAGE_RETURN = '\n';

function x() {
  return c in CHARS ? CHARS[c] : CHARS.NORMAL;
}

var CHARS = (_CHARS = {}, _defineProperty(_CHARS, DOUBLE_QUOTE, 0), _defineProperty(_CHARS, SINGLE_QUOTE, 1), _defineProperty(_CHARS, DOUBLE_QUOTE, 2), _defineProperty(_CHARS, 'NORMAL', 3), _defineProperty(_CHARS, WHITE_SPACE, 4), _defineProperty(_CHARS, CARRIAGE_RETURN, 5), _CHARS);

var c = '';
var stash = '';
var ret = [];

function reset() {
  escaped = false;
  single_quoted = false;
  double_quoted = false;
  ended = false;
  c = '';
  stash = '';
  ret.length = 0;
}

function a() {
  stash += c;
}

function sq() {
  single_quoted = true;
}

function suq() {
  single_quoted = false;
}

function dq() {
  double_quoted = true;
}

function duq() {
  double_unquote = false;
}

function e() {
  escaped = true;
}

function ue() {
  escaped = false;
}

// add a backslash and a normal char, and turn off escaping
function aue() {
  stash += BACK_SLASH + c;
  escaped = false;
}

// add a escaped char and turn off escaping
function eaue() {
  stash += c;
  escaped = false;
}

// try to push
function tp() {
  if (stash) {
    ret.push(stash);
    stash = '';
  }
}

function EOF() {
  ended = true;
}

function split(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Str must be a string. Received ${str}');
  }

  reset();

  var length = str.length;
  var i = 0;

  while (++i < length) {
    c = str[i];

    MATRIX[y()][x()]();

    if (ended) {
      break;
    }
  }

  if (single_quoted) {
    error('unmatched single quote', 'UNMATCHED_SINGLE');
  }

  if (double_quoted) {
    error('unmatched double quote', 'UNMATCHED_DOUBLE');
  }

  if (escaped) {
    error('unexpected end with \\', 'ESCAPED_EOF');
  }

  return ret;
}

function error(message, code) {
  var err = new Error(message);
  err.code = code;
  throw err;
}

// function join (args, options = {}) {
//   const quote = options.quote || "'"

//   return args.map(function (arg) {
//     if (!arg) {
//       return
//     }

//     return /\c+/.test(arg)
//       // a b c -> 'a b c'
//       // a 'b' -> 'a \'b\''
//       ? quote + arg.replace("'", "\\'") + quote
//       : arg

//   }).join(WHITE_SPACE)
// }