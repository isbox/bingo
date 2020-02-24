/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const yamljs = require('yamljs');
const NodeSSH = require('node-ssh');
const program = require('commander');

const zettingFilePath = path.join(__dirname, 'zetting.yml');
const zetting = yamljs.parse(fs.readFileSync(zettingFilePath).toString());

program
  .version('0.0.1')
  .action('')
  .option('-e, --env <type>', 'environment for program')
  .parse(process.argv);


if (!program.env) {
  console.log('环境参数错误');
  process.exit(1);
}

function deploy(envZetting) {
  console.log(envZetting);
  const pass = Buffer.from(envZetting.password, 'base64').toString();
  const ssh = new NodeSSH();
  ssh.connect({
    host: envZetting.host,
    username: envZetting.name,
    password: pass,
  }).then(async () => {
    try {
      await ssh.execCommand('cp -r /usr/share/nginx/demeter-web-dev /usr/share/nginx/demeter-web-dev-before');
      const result = await ssh.execCommand('ls', { cwd: '/usr/share/nginx/' });
      console.log(result.stdout);
    } catch (e) {
      console.log(e);
    }
  });
}

if (program.env === 'qa') {
  deploy(zetting[program.env]);
}
// deploy();
