const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
  MalNil,
  MalFunction,
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

const handleFn = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);

  const doForms = new MalList([new MalSymbol("do"), ...body]);

  return new MalFunction(doForms, binds, env);
};

const handleLet = (ast, env) => {
  const innerEnv = new Env(env);
  const bindingList = ast.value[1].value;

  for (let index = 0; index < bindingList.length; index += 2) {
    const value = bindingList[index + 1];
    innerEnv.set(bindingList[index], EVAL(value, innerEnv));
  }

  return [ast.value[2], innerEnv];
};

const handleDo = (ast, env) => {
  const forms = ast.value.slice(1);

  for (let index = 0; index < forms.length - 1; index++) {
    EVAL(forms[index], env);
  }
  return forms[forms.length - 1];
};

const handleIf = (ast, env) => {
  const result = EVAL(ast.value[1], env);
  return !(result instanceof MalNil || result === false)
    ? ast.value[2]
    : ast.value[3] !== undefined
    ? ast.value[3]
    : new MalNil();
};

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);

    if (ast.isEmpty()) return ast;

    switch (ast.value[0].value) {
      case "def!":
        return handleDef(ast, env);
      case "let*":
        [ast, env] = handleLet(ast, env);
        break;
      case "do":
        ast = handleDo(ast, env);
        break;
      case "if":
        ast = handleIf(ast, env);
        break;
      case "fn*":
        ast = handleFn(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds, args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = (arg) => pr_str(arg, true);

const rep = (arg) => PRINT(EVAL(READ(arg), env));

const createReplEnv = () => {
  for (const symbol in ns) {
    env.set(new MalSymbol(symbol), ns[symbol]);
  }
  env.set(new MalSymbol("eval", (ast) => EVAL(ast, env)));
  rep("(def! not (fn* (a) (if a false true)))");
};

const env = new Env();
createReplEnv();

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
