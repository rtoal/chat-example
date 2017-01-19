const gameutil = require('../server/gameutil');
const assert = require('assert');

describe('The clamp function', () => {
  it('accepts values in range', (done) => {
    assert.equal(gameutil.clamp(7, -10, 20), 7);
    done();
  });
  it('clamps to lower bound', (done) => {
    assert.equal(gameutil.clamp(7, 10, 20), 10);
    done();
  });
  it('clamps to upper bound', (done) => {
    assert.equal(gameutil.clamp(7, 3, 5), 5);
    done();
  });
});

// TODO More to test
