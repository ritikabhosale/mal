const { MalList, MalNil } = require("./types");

const areAllEqual = (args) => {
  return args.every((item) => deepEquals(item, args[0]));
};

const deepEquals = (a, b) => {
  if (typeof a !== typeof b) return false;

  if (typeof a === "number" && typeof b === "number") return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    if (a.length === 0 && b.length === 0) return true;

    if (!deepEquals(a[0], b[0])) return false;
    return deepEquals(a.slice(1), b.slice(1));
  }

  return true;
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
