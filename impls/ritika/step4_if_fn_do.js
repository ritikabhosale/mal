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
const { ns } = require("./core.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
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

const evaluateForms = (forms) => {
  let result;
  for (let index = 0; index < forms.length; index++) {
    result = EVAL(forms[index], env);
  }
  return result;
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
    case "do":
      const elements = ast.value.slice(1);
      return evaluateForms(elements);
    case "if":
      return !(EVAL(ast.value[1], env) instanceof MalNil)
        ? EVAL(ast.value[2], env)
        : ast.value[3]
        ? EVAL(ast.value[3], env)
        : new MalNil();
    case "fn*":
      return (exprs) => {
        const newEnv = new Env(env, ast.value[1], exprs);
        return EVAL(ast.value[2], newEnv);
      };
  }

  const [fn, ...args] = eval_ast(ast, env).value;

  return fn.apply(null, args);
};

const PRINT = (arg) => pr_str(arg);

const env = new Env();

for (const symbol in ns) {
  env.set(new MalSymbol(symbol), ns[symbol]);
}

env.set(new MalSymbol("list"), (...args) => new MalList(args));

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
