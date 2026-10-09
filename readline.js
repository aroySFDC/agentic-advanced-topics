const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

async function main() {
  // Create the interface
  const rl = readline.createInterface({ input, output });

  try {
    // Ask questions sequentially using await
    const name = await rl.question('What is your name? ');
    console.log(`Hello, ${name}!`);

    const color = await rl.question('What is your favorite color? ');
    console.log(`Cool, I like ${color} too.`);
  } finally {
    // Always close the interface to prevent memory leaks and let the process exit
    rl.close();
  }
}

main();