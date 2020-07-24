const chalk = require('chalk');
const shell = require('child_process');
const log = require('../logger.js');

shell.exec('git push', function (error, stdout, stderr) {
  if (error) {
    log.error('error: ', error);
    return;
  }
  if (stderr.replace(/[\r\n]/g, '') == 'Everything up-to-date') {
    log.info(stderr);
    log.info(chalk.yellow('no thing to push'));
    return;
  }
  log.info(stderr);
  var httpUrlHEAD;
  shell.exec('git remote get-url --push origin', function (error, stdout, stderr) {
    if (error) return;
    // 删掉换行符
    stdout = stdout.substring(0, stdout.length - 1);
    // 如果有.git后缀，则删掉
    httpUrlHEAD = stdout.replace(/\.git/, '');
  });
  var httpUrlSHA1;
  shell.exec('git rev-parse HEAD', function (error, stdout, stderr) {
    if (error) return;
    httpUrlSHA1 = stdout;
  });
  setTimeout(function () {
    if (httpUrlHEAD && httpUrlSHA1) {
      const httpUrl = `${httpUrlHEAD}/commit/${httpUrlSHA1}`;
      log.info(' ☕️ review URL: ' + chalk.green(httpUrl));
    } else {
      log.info(chalk.red(' X 抱歉，暂时无法返回review链接，请稍后重试'));
    }
  }, 300);
});
