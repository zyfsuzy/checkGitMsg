#!/usr/bin/env node

const CZ_CONFIG_NAME = './cz-config.js';
const findConfig = require('find-config');
const editor = require('editor');
const temp = require('temp').track();
const fs = require('fs');
const path = require('path');
const log = require('./logger');
const buildCommit = require('./buildCommit');

const readConfigFile = () => {
  // step 1：优先寻找用户自定义的package.json中的 config['cz-customizable'].config
  let pkg = findConfig('package.json', { home: false });
  if (pkg) {
    const pkgDir = path.dirname(pkg);

    pkg = require(pkg);

    if (pkg.config && pkg.config['cz-customizable'] && pkg.config['cz-customizable'].config) {
      const pkgPath = path.resolve(pkgDir, pkg.config['cz-customizable'].config);

      log.info('>>> 正在使用下面路径中的 cz-customizable 配置文件: ', pkgPath);

      return require(pkgPath);
    }
  }

  // step 2：如果step 1未找到，那么就用本工具自带的配置文件 cz-config.js
  const czConfig = require(CZ_CONFIG_NAME);

  if (czConfig) {
    return czConfig;
  }

  log.warn('没有找到配置文件，请检查是否存在 cz-config.js');
  return null;
};

module.exports = {
  prompter(cz, commit) {
    const config = readConfigFile();
    config.subjectLimit = config.subjectLimit || 100;

    const questions = require('./questions').getQuestions(config, cz);

    cz.prompt(questions).then((answers) => {
      if (answers.confirmCommit === 'edit') {
        temp.open(null, (err, info) => {
          /* istanbul ignore else */
          if (!err) {
            fs.writeSync(info.fd, buildCommit(answers, config));
            fs.close(info.fd, () => {
              editor(info.path, (code) => {
                if (code === 0) {
                  const commitStr = fs.readFileSync(info.path, {
                    encoding: 'utf8',
                  });
                  commit(commitStr);
                } else {
                  log.info(`Editor returned non zero value. Commit message was:\n${buildCommit(answers, config)}`);
                }
              });
            });
          }
        });
      } else if (answers.confirmCommit === 'yes') {
        commit(buildCommit(answers, config));
      } else {
        log.info('Commit has been canceled.');
      }
    });
  },
};
