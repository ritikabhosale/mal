const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
  MalNil,
} = require("./types.js");
const { Env } = require("./env.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const _env = {
  "+": (...args) => args.reduce((a, b) => a + b),
  "-": (...args) => args.reduce((a, b) => a - b),
  "*": (...args) => args.reduce((a, b) => a * b),
  "/": (...args) => args.reduce((a, b) => a / b),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
    ``;
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

const createInnerEnv = (env, bindingList) => {
  const innerEnv = new Env(env);

  for (let index = 0; index < bindingList.length; index += 2) {
    const value = bindingList[index + 1];
    innerEnv.set(bindingList[index], EVAL(value, innerEnv));
  }

  return innerEnv;
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case "def!":
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case "let*":
      const innerEnv = createInnerEnv(env, ast.value[1].value);
      return EVAL(ast.value[2], innerEnv);
  }

  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
};

const PRINT = (arg) => pr_str(arg);

const env = new Env();
env.set(new MalSymbol("+"), (...args) => args.reduce((a, b) => a + b));
env.set(new MalSymbol("-"), (...args) => args.reduce((a, b) => a - b));
env.set(new MalSymbol("*"), (...args) => args.reduce((a, b) => a * b));
env.set(new MalSymbol("/"), (...args) => args.reduce((a, b) => a / b));

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
