const path = require('path');
const debug = require('debug');
const { resolveFilePath } = require('./lib/helpers');

module.exports = app => name => {
  const { capturesDir } = app.config;
  const capturePath = path.join(capturesDir, name);
  const filePath = resolveFilePath(capturePath, 'index.js');
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const captures = require(filePath);

  debug('mockyeah:serve:play')(name);

  captures.map(capture => app.routeManager.all(...capture));
};
