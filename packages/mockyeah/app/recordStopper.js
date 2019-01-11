const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const debug = require('debug');
const relativeRoot = require('../lib/relativeRoot');
const {
  resolveFilePath,
  getDataForRecordToFixtures,
  replaceFixtureWithRequireInJson
} = require('./lib/helpers');

module.exports = app => cb => {
  app.locals.recording = false;

  if (!app.locals.recordMeta) {
    return;
  }

  const { recordToFixtures, recordToFixturesMode, formatScript } = app.config;

  const {
    recordMeta: { name, set }
  } = app.locals;

  if (!name) throw new Error('Not recording.');

  const { capturesDir, fixturesDir } = app.config;

  const capturePath = path.join(capturesDir, name);

  mkdirp.sync(capturePath);

  const filePath = resolveFilePath(capturePath, 'index.js');

  const newSet = set.map((capture, index) => {
    const [match, responseOptions] = capture;

    debug('mockyeah:serve:capture')(match.url || match.path || match);

    if (recordToFixtures) {
      const { newResponseOptions, body } = getDataForRecordToFixtures({
        responseOptions,
        name,
        index
      });

      const { fixture } = newResponseOptions;

      if (fixture) {
        const fixturesPath = path.join(fixturesDir, fixture);

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        mkdirp.sync(path.join(fixturesDir, name));

        // TODO: Any easy way to coordinate this asynchronously?
        // eslint-disable-next-line no-sync
        fs.writeFileSync(fixturesPath, body);
      }

      return [match, newResponseOptions];
    }

    return [match, responseOptions];
  });

  let js = JSON.stringify(newSet, null, 2);

  if (recordToFixturesMode === 'require') {
    js = replaceFixtureWithRequireInJson(js, {
      relativePath: path.relative(capturePath, fixturesDir)
    });
  }

  let jsModule = `module.exports = ${js};`;

  if (formatScript) {
    let formatFunction;

    if (typeof formatScript === 'string') {
      const formatScriptModulePath = path.resolve(relativeRoot, formatScript);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      formatFunction = require(formatScriptModulePath);
    } else {
      formatFunction = formatScript;
    }

    if (formatFunction) {
      jsModule = formatFunction(jsModule);
    }
  }

  fs.writeFile(filePath, jsModule, err => {
    if (err) {
      debug('mockyeah:response:error')(err);

      cb(err);

      return;
    }

    set.forEach(capture => {
      debug('mockyeah:response:saved')(capture[0].path || capture[0].url || capture[0]);
    });

    if (typeof app.locals.proxyingBeforeRecording !== 'undefined') {
      app.locals.proxying = app.locals.proxyingBeforeRecording;
      delete app.locals.proxyingBeforeRecording;
    }

    delete app.locals.recordMeta;

    if (cb) cb();
  });
};
