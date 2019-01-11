'use strict';

/* eslint-disable prefer-arrow-callback */

const { exec } = require('child_process');
const { expect } = require('chai');

describe('Config', () => {
  it('should write output to stdout by default', function(done) {
    exec(
      `DEBUG='mockyeah*' echo "
      const mockyeah = new require('./server')({ port: 0, adminPort: 0 }, function() { process.exit() });
      " | DEBUG='mockyeah*' node`,
      { env: { DEBUG: 'mockyeah*' } },
      function(err, stdout) {
        expect(stdout).to.include('mockyeah');
        done();
      }
    );
  });

  it('should write output to stdout when enabled', function(done) {
    exec(
      `DEBUG='mockyeah*' echo "
      const mockyeah = new require('./server')({ port: 0, adminPort: 0, output: true }, function() { process.exit() });
      " | DEBUG='mockyeah*' node`,
      function(err, stdout) {
        expect(stdout).to.include('mockyeah');
        done();
      }
    );
  });

  it('should not write to stdout when disabled', function(done) {
    exec(
      `echo "
      const mockyeah = new require('./server')({ port: 0, adminPort: 0, output: false }, function() { process.exit() });
      " | node`,
      { env: { DEBUG: 'mockyeah*' } },
      function(err, stdout) {
        expect(stdout).to.not.include('mockyeah');
        done();
      }
    );
  });
});
