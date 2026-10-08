const { spawn } = require('child_process');

const child = spawn('npx.cmd', ['drizzle-kit', 'generate']);

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('rename column')) {
    console.log('Sending enter...');
    child.stdin.write('\r\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
