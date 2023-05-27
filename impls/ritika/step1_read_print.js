const readline = require("readline");
const { read_str } = require("./reader.js");
const { pr_str } = require("./printer.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (arg) => read_str(arg);

const EVAL = (arg) => arg;

const PRINT = (arg) => pr_str(arg);

const rep = (arg) => PRINT(EVAL(READ(arg)));

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
