const readline = require("readline");
const { read_str } = require("./reader.js");
const {
  MalSymbol,
  MalList,
  MalVector,
  MalHashMap,
  MalNil,
  MalFunction,
  MalSequence,
  pr_str,
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

const quasiquote = (ast, env) => {
  if (ast instanceof MalList && ast.beginsWith("unquote")) {
    return ast.value[1];
  }
  if (ast instanceof MalSequence) {
    let result = new MalList([]);
    for (let index = ast.value.length - 1; index >= 0; index--) {
      const element = ast.value[index];
      if (element instanceof MalList && element.beginsWith("splice-unquote")) {
        result = new MalList([
          new MalSymbol("concat"),
          element.value[1],
          result,
        ]);
      } else {
        result = new MalList([
          new MalSymbol("cons"),
          quasiquote(element),
          result,
        ]);
      }
    }
    return ast instanceof MalList
      ? result
      : new MalList([new MalSymbol("vec"), result]);
  }

  if (ast instanceof MalSymbol) {
    return new MalList([new MalSymbol("quote"), ast]);
  }

  return ast;
};

const handleFn = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);

  const doForms = new MalList([new MalSymbol("do"), ...body]);

  const fn = (...exprs) => {
    const newEnv = new Env(env, ast.value[1], exprs);
    return EVAL(ast.value[2], newEnv);
  };

  return new MalFunction(doForms, binds, env, fn);
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

const handleDefMacro = (ast, env) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;

  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
};

const isMacroCall = (ast, env) => {
  try {
    return (
      ast instanceof MalList &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro
    );
  } catch {
    return false;
  }
};

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  }

  return ast;
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);

    if (ast.isEmpty()) return ast;

    ast = macroExpand(ast, env);

    if (!(ast instanceof MalList)) return eval_ast(ast, env);

    switch (ast.value[0].value) {
      case "def!":
        return handleDef(ast, env);
      case "defmacro!":
        return handleDefMacro(ast, env);
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
      case "quote":
        return ast.value[1];
      case "quasiquote":
        ast = quasiquote(ast.value[1], env);
        break;
      case "quasiquoteexpand":
        return quasiquote(ast.value[1]);
      case "macroexpand":
        return macroExpand(ast.value[1], env);
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
  env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
  env.set(new MalSymbol("*ARGV*"), new MalList(process.argv.slice(2)));
  rep("(def! not (fn* (a) (if a false true)))");
  rep(
    '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
  );
  rep(
    "(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))"
  );
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

if (process.argv.length >= 3) {
  const code = '(load-file "' + process.argv[2] + '")';
  rep(code);
  rl.close();
} else {
  main();
}
