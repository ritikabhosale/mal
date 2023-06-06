const assert = require("assert");
const { MalList, MalNil, MalAtom, MalString, MalVector } = require("./types");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const fs = require("fs");

const areAllEqual = (args) => {
  return args.every((item) => deepEquals(item, args[0]));
};

const deepEquals = (a, b) => {
  try {
    assert.deepEqual(a, b);
    return true;
  } catch (err) {
    return false;
  }
};

const isInDescendingOrder = (items) => {
  const list = [...items];
  list.pop();
  return list.every((item, index) => item >= items[index + 1]);
};

const isNextGreaterThanCurrent = (items) => {
  const list = [...items];
  list.pop();
  return list.every((item, index) => item > items[index + 1]);
};

const isNextLesserThanCurrent = (items) => {
  const list = [...items];
  list.pop();
  return list.every((item, index) => item < items[index + 1]);
};

const isInAscendingOrder = (items) => {
  const list = [...items];
  list.pop();
  return list.every((item, index) => item <= items[index + 1]);
};

const ns = {
  "+": (...args) => args.reduce((a, b) => a + b),

  "-": (...args) => args.reduce((a, b) => a - b),

  "*": (...args) => args.reduce((a, b) => a * b),

  "/": (...args) => args.reduce((a, b) => a / b),

  "=": (...args) => areAllEqual(args),

  ">=": (...args) => isInDescendingOrder(args),

  "<=": (...args) => isInAscendingOrder(args),

  ">": (...args) => isNextGreaterThanCurrent(args),

  "<": (...args) => isNextLesserThanCurrent(args),

  "list?": (...args) => args[0] instanceof MalList,

  "empty?": (...args) => args[0].isEmpty(),

  count: (...args) => args[0].count(),

  list: (...args) => new MalList(args),

  prn: (...args) => {
    const str = args.map((x) => pr_str(x, true)).join(" ");
    console.log(str);
    return new MalNil();
  },

  println: (...args) => {
    const str = args.map((x) => pr_str(x, fasle)).join(" ");
    console.log(str);
    return new MalNil();
  },

  slurp: (fileName) =>
    new MalString(
      fs.readFileSync(fileName.pr_str(false), { encoding: "utf8" })
    ),

  "pr-str": (...args) => args.map((x) => pr_str(x, true)).join(" "),

  str: (...args) => new MalString(args.map((x) => pr_str(x, false)).join()),

  "read-string": (str) => read_str(str.value),

  atom: (value) => new MalAtom(value),

  "atom?": (value) => value instanceof MalAtom,

  deref: (atom) => atom.deref(),

  "reset!": (atom, value) => atom.reset(value),

  "swap!": (atom, fn, ...args) => atom.swap(fn, args),

  cons: (value, list) => new MalList([value, ...list.value]),

  concat: (...lists) => new MalList(lists.flatMap((x) => x.value)),

  vec: (list) => new MalVector(list.value.slice()),
};

module.exports = { ns };
