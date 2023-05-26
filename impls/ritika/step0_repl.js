const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (arg) => arg;

const EVAL = (arg) => arg;

const PRINT = (arg) => arg;

const rep = (arg) => PRINT(EVAL(READ(arg)));

const main = () => {
  rl.question("user> ", (input) => {
    console.log(rep(input));
    main();
  });
};

main();
