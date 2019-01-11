const fs = require('fs');
const path = require('path');
const debug = require('debug');

module.exports = app => () => {
  const { capturesDir } = app.config;

  debug('mockyeah:serve')('play all');

  fs.readdir(capturesDir, (err, files) => {
    if (err) throw err;

    const dirs = files.filter(file =>
      // eslint-disable-next-line no-sync
      fs.statSync(path.join(capturesDir, file)).isDirectory()
    );

    dirs.forEach(file => {
      app.play(file);
    });
  });
};
