const {
  MalSymbol,
  MalList,
  MalVector,
  MalNil,
  MalHashMap,
  MalString,
  MalKeyword,
} = require("./types.js");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const currentToken = this.peek();
    this.position++;
    return currentToken;
  }
}

const tokenize = (arg) => {
  const re =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  return [...arg.matchAll(re)]
    .map((x) => x[1])
    .slice(0, -1)
    .filter((x) => !x.startsWith(";"));
};

const read_seq = (reader, symbol) => {
  const ast = [];
  reader.next();

  while (reader.peek() != symbol) {
    if (reader.peek() === undefined) {
      throw "unbalanced";
    }
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_list = (reader) => {
  const ast = read_seq(reader, ")");
  return new MalList(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, "]");
  return new MalVector(ast);
};

const read_hash_map = (reader) => {
  const ast = read_seq(reader, "}");
  return new MalHashMap(ast);
};

const createMalString = (str) => {
  const value = str.replace(/\\(.)/g, (y, captured) =>
    captured === "n" ? "\n" : captured
  );
  return new MalString(value);
};

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }

  if (token === "true") return true;
  if (token === "false") return false;
  if (token === "nil") return new MalNil();
  if (token.startsWith('"')) return createMalString(token.slice(1, -1));
  if (token.startsWith(":")) return new MalKeyword(token);

  return new MalSymbol(token);
};

const prependSymbol = (reader, symbol) => {
  reader.next();
  return new MalList([new MalSymbol(symbol), read_form(reader)]);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token[0]) {
    case "(":
      return read_list(reader);
    case "[":
      return read_vector(reader);
    case "{":
      return read_hash_map(reader);
    case "@":
      return prependSymbol(reader, "deref");
    default:
      return read_atom(reader);
  }
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);

  const a = read_form(reader);
  return a;
};

module.exports = { read_str };
