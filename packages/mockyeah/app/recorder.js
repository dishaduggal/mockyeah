const debug = require('debug');

module.exports = app => (name, options = {}) => {
  let only;

  app.locals.recording = true;

  if (!name) throw new Error('Must provide a recording name.');
  debug('mockyeah:serve:record')(name);

  if (options.only && typeof options.only === 'string') {
    // if only is truthy, assume it is a regex pattern
    const regex = new RegExp(options.only);
    only = regex.test.bind(regex);
    debug('mockyeah:record:only')(regex);
  }

  const enhancedOptions = Object.assign({}, options, {
    only
  });

  app.locals.recordMeta = {
    name,
    options: enhancedOptions,
    set: []
  };

  // Store whether we're proxying so we can reset it later.
  app.locals.proxyingBeforeRecording = app.locals.proxying;

  // We must proxy in order to record.
  app.proxy();
};
