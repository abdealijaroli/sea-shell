const readline = require('readline');
const fs = require('fs');
const { spawn } = require('child_process');

const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout,
     prompt: '> '
});

let child;

const commands = {
     pwd: () => {
          console.log(process.cwd());
     },
     cd: (directory) => {
          try {
               process.chdir(directory);
          } catch (err) {
               console.error(`cd: ${directory}: No such file or directory`);
          }
     },
     ls: () => {
          fs.readdir(process.cwd(), (err, files) => {
               if (err) {
                    console.error(err);
                    return;
               }
               files.forEach((file) => {
                    console.log(file);
               });
          });
     },
     fg: (command, ...args) => {
          if (child) {
               console.error('fg: another command is already running in the foreground');
               return;
          }

          child = spawn(command, args, {
               stdio: 'inherit'
          });

          child.on('exit', (code) => {
               console.log(`${command} exited with code ${code}`);
               child = null;
               rl.prompt();
          });
     },
     '<path_to_binary>': (path) => {
          if (child) {
               console.error('fg: another command is already running in the foreground');
               return;
          }

          fs.access(path, fs.constants.X_OK, (err) => {
               if (err) {
                    console.error(`${path}: Permission denied`);
                    return;
               }

               child = spawn(path, [], {
                    stdio: 'inherit'
               });

               child.on('exit', (code) => {
                    console.log(`${path} exited with code ${code}`);
                    child = null;
                    rl.prompt();
               });
          });
     },
     exit: () => {
          process.exit(0);
     }
};

rl.prompt();

rl.on('line', (input) => {
     const [command, ...args] = input.split(' ');
     if (commands[command]) {
          commands[command](...args);
     } else {
          console.error(`${command}: command not found`);
     }

     if (!child) {
          rl.prompt();
     }
});
