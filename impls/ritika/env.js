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
    this.#binds?.value.forEach((bind, index) => {
      this.set(bind, this.#exprs[index]);
    });
  }

  set(symbol, value) {
    this.data[symbol.value] = value;
  }

  find(symbol) {
    if (this.data[symbol.value]) {
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
