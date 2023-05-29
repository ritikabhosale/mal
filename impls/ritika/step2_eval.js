const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");
const { MalSymbol, MalList, MalVector, MalHashMap } = require("./types.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  "+": (...args) => args.reduce((a, b) => a + b),
  "-": (...args) => args.reduce((a, b) => a - b),
  "*": (...args) => args.reduce((a, b) => a * b),
  "/": (...args) => args.reduce((a, b) => a / b),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalHashMap(newAst);
  }

  return ast;
};

const READ = (arg) => read_str(arg);

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (arg) => pr_str(arg);

const rep = (arg) => PRINT(EVAL(READ(arg), env));

const main = () => {
  rl.question("user> ", (input) => {
    try {
      console.log(rep(input));
    } catch (e) {
      console.log(e);
    }
    main();
  });
};

main();
