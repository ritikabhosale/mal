const { MalList } = require("./types");

class Env {
  #outer;
  #binds;
  #exprs;

  constructor(outer, binds, exprs) {
    this.#outer = outer;
    this.#binds = binds;
    this.#exprs = exprs;
    this.data = {};
    this.#setbindArgsToExprs();
  }

  #setbindArgsToExprs() {
    if (this.#binds) {
      const list = this.#binds.value;
      for (let index = 0; index < list.length; index++) {
        if (list[index].value === "&") {
          this.set(list[index + 1], new MalList(this.#exprs.slice(index)));
          return;
        }
        this.set(list[index], this.#exprs[index]);
      }
    }
  }

  set(symbol, value) {
    this.data[symbol.value] = value;
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) {
      throw `${symbol.value} not found`;
    }
    return env.data[symbol.value];
  }
}

module.exports = { Env };
