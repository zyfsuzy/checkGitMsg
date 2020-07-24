const shell = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');
const log = require('../logger.js');

module.exports = (filenames) => {
  if (!filenames.length) {
    // 第一种：hgit add后不加任何参数
    noParams();
  } else {
    // 第二种：hgit add后加了.或多个文件
    hasParams(filenames);
  }
};

function noParams() {
  // 待添加的文件
  const choices = [];
  // Untracked files idx
  let addIdx;
  let inquirerFlag = false;
  shell.exec('git status', function (error, stdout, stderr) {
    let tree = stdout.split('\n');
    tree.filter((item, idx) => {
      if (item.indexOf('Untracked files:') != -1) {
        inquirerFlag = true;
        addIdx = idx += 2;
        for (let i = addIdx; i < tree.length; i++) {
          if (!tree[i].replace(/\s/g, '')) return;
          tree[i] = tree[i].replace(/\s/g, '');
          choices.push(tree[i]);
        }
      }
      if (item.indexOf('Changes not staged for commit:') != -1) {
        inquirerFlag = true;
        addIdx = idx += 3;
        for (let i = addIdx; i < tree.length; i++) {
          if (!tree[i].replace(/\s/g, '')) return;
          tree[i] = tree[i].split(':')[1].replace(/\s/g, '');
          choices.push(tree[i]);
        }
      }
    });
  });
  setTimeout(() => {
    if (inquirerFlag) {
      inquirer
        .prompt([
          {
            type: 'checkbox',
            name: 'filename',
            message: '请选择需要添加进暂存区的文件',
            choices: choices,
          },
        ])
        .then((answers) => {
          const filename = answers.filename;
          const filesArr = [];
          filename.filter((item) => {
            if (item.charAt(item.length - 1).indexOf('/') != -1) {
              item = item + '*';
            }
            filesArr.push(item);
          });
          setTimeout(() => {
            const files = filesArr.toString().replace(/,/g, ' ');
            const cmd = `git add ${files}`;
            shell.execSync(cmd, function () {});
          }, 300);
        });
    } else {
      log.info(chalk.yellow('没有任何更新需要add, 请输入hgit st检查状态'))
    }
  }, 300);
}

function hasParams(filenames) {
  var files = [];
  for (var i = 0; i < filenames.length; i++) {
    if (filenames[i] == '.') {
      shell.exec('git add .', function (error, stdout, stderr) {
        if (error) return;
      });
      return;
    } else {
      files.push(filenames[i]);
    }
  }
  var cmd = 'git add ' + files.toString();
  shell.exec(cmd, function (error, stdout, stderr) {
    if (stderr) {
      log.error(stderr);
      return;
    }
  });
}
