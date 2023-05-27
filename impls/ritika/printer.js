const { MalValue } = require("./types.js");

const pr_str = (malValue) => {
  return malValue instanceof MalValue ? malValue.pr_str() : malValue;
};

module.exports = { pr_str };
