import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl.stdoutMuted = true;
const originalWrite = rl._writeToOutput.bind(rl);
rl._writeToOutput = function (text) {
  if (this.stdoutMuted && !text.includes('Senha')) return;
  originalWrite(text);
};
rl.question('Senha do administrador: ', (password) => {
  rl.close();
  if (password.length < 12) { console.error('\nUse pelo menos 12 caracteres.'); process.exitCode = 1; return; }
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  console.log(`\nADMIN_PASSWORD_HASH=${salt}:${hash}`);
});
