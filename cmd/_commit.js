#!/usr/bin/env node

const { execSync } = require('child_process');
const inquirer = require('inquirer');
const os = require('os').platform();

const app = require('../index');
const log = require('../logger');

const modifyCommitMsg = () => {
  let logMsgArr = execSync('git log -1').toString().split('\n');
  // review链接
  let dUrl = logMsgArr.splice(-2, 2);
  // 将review链接调整至jira号上方
  logMsgArr.splice(-2, 0, ...dUrl);
  // 去除log头部信息
  logMsgArr = logMsgArr.slice(4, -1);
  // 格式化
  let logMsg = logMsgArr.toString().replace(/,/g, '\n');
  execSync('git reset --soft HEAD^', { stdio: [0, 1, 2] });
  execSync(`git commit -m "${logMsg}"`, { stdio: [0, 1, 2] });
};

const commit = (msg) => {
  try {
    const { commitMessage, needReview } = msg;
    if (os == 'win32') {
      let winMsg = commitMessage.replace(/\n\n/g, '\r\n\r\n');
      const winCmd = `git commit -m "${winMsg}"`;
      execSync(winCmd, { stdio: [0, 1, 2] });
    } else {
      const cmd = `git commit -m "${commitMessage}"`;
      execSync(cmd, { stdio: [0, 1, 2] });
    }
    if (needReview) {
      execSync('arc diff --create --encoding gbk', { stdio: [0, 1, 2] });
      modifyCommitMsg();
    }
  } catch (error) {
    log.error('>>> ERROR', error.error);
  }
};

app.prompter(inquirer, commit);
