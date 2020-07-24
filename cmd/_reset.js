'use strict';
const inquirer = require('inquirer');
const shell = require('child_process');
const log = require('../logger.js');

const questions = [
  {
    type: 'confirm',
    name: 'preset',
    message: '是否采用预设选项? ',
  },
  {
    type: 'rawlist',
    name: 'resetnum',
    message: '请选择常用的几种回退选项: ',
    choices: [
      {
        value: 'git reset --hard HEAD^',
        name: '回退到上一个版本, 清空工作目录, 清空暂存区',
      },
      {
        value: 'git reset --soft HEAD^',
        name: '回退到上一个版本, 保留工作目录, 并把重置HEAD带来的差异放进暂存区',
      },
      {
        value: 'git reset --mixed HEAD^',
        name: '回退到上一个版本, 保留工作目录, 清空暂存区',
      },
    ],
    when: function (answers) {
      return answers.preset;
    },
  },
  {
    type: 'list',
    name: 'mode',
    message: '请选择reset的模式: (hard/soft/mixed)',
    choices: [
      {
        value: 'hard ',
        name: 'hard:  清空工作目录, 清空暂存区',
      },
      {
        value: 'soft ',
        name: 'soft:  保留工作目录, 并把重置HEAD带来的差异放进暂存区',
      },
      {
        value: 'mixed ',
        name: 'mixed: 保留工作目录, 清空暂存区',
      },
    ],
    when: function (answers) {
      return !answers.preset;
    },
  },
  {
    type: 'input',
    name: 'headnum',
    message: '请输入要回退的版本个数 or 要回退到对应版本的commit id: ',
    when: function (answers) {
      return answers.mode;
    },
    filter: function (value) {
      if (value.length > 8) {
        value = value.substring(0, 8);
      }
      return value;
    },
    validate: function (value) {
      if (value.length == 8 || Number(value)) {
        return true;
      } else {
        return '请正确输入的要回退的版本个数 or 要回退到对应版本的commit id';
      }
    },
  },
];

inquirer.prompt(questions).then((answers) => {
  if (answers.preset) {
    shell.exec(answers.resetnum, function (error, stdout, stderr) {
      if (error) {
        log.error('error: ', error);
        return;
      }
      log.info(stdout);
    });
  } else {
    var cmd;
    if (answers.headnum.length == 8) {
      cmd = 'git reset --' + answers.mode + answers.headnum;
    } else {
      cmd = 'git reset --' + answers.mode + 'HEAD~' + answers.headnum;
    }
    shell.exec(cmd, function (error, stdout, stderr) {
      if (error) {
        log.error('error: ', error);
        return;
      }
      log.info(stdout);
    });
  }
});
