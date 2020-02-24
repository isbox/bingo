const program = require('commander');
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const colors = require('colors'); // console带颜色输出

// 执行打包
const fatherBuild = function() {
  const fatherBuild = spawnSync('father', ['build'], {
    shell: process.platform === 'win32', // win兼容
  });
  const { stderr, stdout } = fatherBuild;

  if (stderr.toString()) {
    console.log(stderr.toString().red);
    process.exit(1);
  }
  console.log(stdout.toString());
}

// 依次打包
const buildOneByOne = function(packages) {
  const package = packages.shift();
  if (package) {
    console.log(`--- 开始打包 ${package}组件 --- \n`.green);
    process.env.PACKAGE = package;
    fatherBuild();
    buildOneByOne(packages);
  } 
}

// 组件依次发布
const publishOneByOne = function (packages) {
  return new Promise((resolve, reject) => {
    const publish = () => {
      const name = packages.shift();
      const comPublish = spawn('yarn', ['publish'], {
        shell: process.platform === 'win32', // win兼容
        cwd: path.resolve(__dirname, `./packages/${name}`),
      });
      comPublish.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      comPublish.stderr.on('error', (err) => {
        console.log(err.red);
      });
      comPublish.on('close', () => {
        if (packages.length) {
          publish(packages);
        } else {
          resolve();
        }
      }) 
    }
    publish();
  });
}

const build = function() {
  program
    .option('-p --packages <items>', '要打包的组件文件夹名称，多个逗号隔开，不要有空格', (value) => {
      return value.split(',');
    })
    .option('-r --release', '发布组件，如果有packages参数则只发布packages中的组件')
    .parse(process.argv);

  const packagesIsArray = Array.isArray(program.packages);

  if (packagesIsArray) {
    const packagesClone = [...program.packages];
    buildOneByOne(packagesClone);
  } else {
    fatherBuild();
  }

  if (program.release) {
    if (!packagesIsArray) {
      console.log('不支持整体发布，请输入要发布的组件名[-p参数]'.red);
      process.exit(1);
    }
    const packagesClone = [...program.packages];
    publishOneByOne(packagesClone)
      .then(() => console.log('--- 组件发布完毕 ---'.green));
  }
};

build();
