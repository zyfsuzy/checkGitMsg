const shell = require('child_process');
const log = require('../logger.js');

shell.exec('git status', function (error, stdout, stderr) {
  if (error) {
    log.error('error: ', error);
    return;
  }
  log.info('stdout: ', stdout);
});
