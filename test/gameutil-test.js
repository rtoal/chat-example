const gameutil = require('../server/gameutil');
const assert = require('assert');

describe('The clamp function', () => {
  it('accepts values in range', () => {
    assert.equal(gameutil.clamp(7, -10, 20), 7);
  });

  it('clamps to lower bound', () => {
    assert.equal(gameutil.clamp(7, 10, 20), 10);
  });

  it('clamps to upper bound', () => {
    assert.equal(gameutil.clamp(7, 3, 5), 5);
  });
});

describe('The randomPoint function', () => {
  it('generates only acceptable points', () => {
    const set = new Set([
      '0,0', '0,1', '0,2',
      '1,0', '1,1', '1,2',
      '2,0', '2,1', '2,2',
      '3,0', '3,1', '3,2',
    ]);
    for (let i = 0; i < 100; i += 1) {
      const point = gameutil.randomPoint(4, 3);
      assert.ok(Array.isArray(point));
      assert.equal(point.length, 2);
      assert.ok(set.has(point.toString()));
    }
  });

  it('can generate all the points', () => {
    const set = new Set([
      '0,0', '0,1', '0,2',
      '1,0', '1,1', '1,2',
      '2,0', '2,1', '2,2',
      '3,0', '3,1', '3,2',
    ]);
    for (let i = 0; i < 100; i += 1) {
      const point = gameutil.randomPoint(4, 3);
      set.delete(point.toString());
    }
    assert.equal(set.size, 0);
  });
});

describe('The permutation function', () => {
  it('permutes the empty array', () => {
    assert.deepStrictEqual(gameutil.permutation(0), []);
  });

  it('permutes the single-element array', () => {
    assert.deepStrictEqual(gameutil.permutation(1), [0]);
  });

  it('returns an array of the desired size', () => {
    [40, 25, 11, 3].forEach((size) => {
      const result = gameutil.permutation(size);
      assert.ok(Array.isArray(result));
      assert.equal(result.length, size);
    });
  });

  it('generates all permutations of [0,1,2] within 100 runs', () => {
    const set = new Set();
    for (let i = 0; i < 100; i += 1) {
      set.add(gameutil.permutation(3).toString());
    }
    assert.ok(set.has('0,1,2'));
    assert.ok(set.has('0,2,1'));
    assert.ok(set.has('1,0,2'));
    assert.ok(set.has('1,2,0'));
    assert.ok(set.has('2,0,1'));
    assert.ok(set.has('2,1,0'));
  });
});
