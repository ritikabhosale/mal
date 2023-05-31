class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return (
      "(" +
      this.value
        .map((x) => (x instanceof MalValue ? x.pr_str() : x))
        .join(" ") +
      ")"
    );
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return (
      "[" +
      this.value
        .map((x) => (x instanceof MalValue ? x.pr_str() : x))
        .join(" ") +
      "]"
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
    result.push(`${list[index]} ${list[index + 1]}${separator}`);
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

class MalNil extends MalValue {
  constructor() {
    super(null);
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
};
