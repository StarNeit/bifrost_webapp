/* eslint-disable @typescript-eslint/no-var-requires */
const { promisify } = require('util');
const childProcess = require('child_process');

const exec = promisify(childProcess.exec);

const getCommitCount = async () => {
  try {
    const { stdout } = await exec('git rev-list --count HEAD');
    return stdout.trim();
  } catch (e) {
    return '';
  }
};

const getLastCommitHash = async () => {
  try {
    const { stdout } = await exec('git rev-parse --short HEAD');
    return stdout.trim();
  } catch (e) {
    return '';
  }
};

module.exports = { getCommitCount, getLastCommitHash };
