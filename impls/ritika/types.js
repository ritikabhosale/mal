const pr_str = (malValue, print_readably) => {
  return malValue instanceof MalValue
    ? malValue.pr_str(print_readably)
    : malValue;
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSequence extends MalValue {}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return `(atom ${pr_str(this.value, print_readably)})`;
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return value;
  }

  swap(fn, args) {
    this.value = fn.apply(null, [this.value, ...args]);
    return this.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(printReadably) {
    if (printReadably) {
      return (
        '"' +
        this.value
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }
    return this.value.toString();
  }

  count() {
    return this.value.length;
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably) {
    return (
      "(" + this.value.map((x) => pr_str(x, print_readably)).join(" ") + ")"
    );
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }

  beginsWith(symbol) {
    return this.value.length > 0 && this.value[0].value === symbol;
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably) {
    return (
      "[" + this.value.map((x) => pr_str(x, print_readably)).join(" ") + "]"
    );
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }
}

const convertIntoHashString = (list) => {
  const result = [];
  for (let index = 0; index < list.length; index += 2) {
    const separator = index + 1 === list.length - 1 ? "" : ",";
    result.push(`${list[index].value} ${list[index + 1]}${separator}`);
  }
  return result;
};

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return "{" + convertIntoHashString(this.value).join(" ") + "}";
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  pr_str() {
    return "#<function>";
  }

  apply(_, args) {
    return this.fn.apply(null, args);
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  count() {
    return 0;
  }

  pr_str() {
    return "nil";
  }
}

module.exports = {
  MalValue,
  MalSymbol,
  MalList,
  MalVector,
  MalNil,
  MalHashMap,
  MalString,
  MalKeyword,
  MalFunction,
  MalAtom,
  MalSequence,
  pr_str,
};
