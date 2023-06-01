const assert = require("assert");
const { MalList, MalNil, MalValue } = require("./types");

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
    console.log(...args);
    return new MalNil();
  },
};

module.exports = { ns };
