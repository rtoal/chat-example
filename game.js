/*
 * Server side game module. Maintains the game state and processes all the messages from clients.
 *
 * Exports:
 *   - move
 *   - state
 *   - addPlayer
 */

const WIDTH = 64;
const HEIGHT = 64;

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function randomPoint() {
  return [
    Math.floor(Math.random() * WIDTH),
    Math.floor(Math.random() * HEIGHT),
  ];
}

// A KEY-VALUE "DATABASE" FOR THE GAME STATE.
//
// The game state is maintained in an object. Your homework assignment is to swap this out
// for a Redis database.
//
// In this version, the players never die. For homework, you need to make a player die after
// five minutes of inactivity. You can use the Redis TTL for this.
//
// Here is how the storage is laid out:
//
// player:<name>    "<row>,<col>"
// scores           sorted set with score and playername
// coins            hash { "<row>,<col>": coinvalue }
// usednames        set of all used names, used to check quickly if a name has been used
//
const database = {
  'player:alice': '4,6',
  'player:bob': '30,10',
  scores: {},
  usednames: new Set(),
  coins: {},
};

exports.addPlayer = (name) => {
  if (database.usednames.has(name)) {
    return false;
  }
  database.usednames.add(name);
  database[`player:${name}`] = randomPoint.toString();
  database.scores[name] = 0;
  return true;
};

function placeCoins() {
  const NUM_SQUARES = WIDTH * HEIGHT;
  const array = Array(NUM_SQUARES).fill(0).map((_, i) =>
    `${Math.floor(i / WIDTH)},${Math.floor(i % WIDTH)}`);
  for (let i = 0; i < 102; i += 1) {
    const j = Math.floor(Math.random() * NUM_SQUARES);
    [array[i], array[j]] = [array[j], array[i]];
  }
  for (let i = 0; i < 50; i += 1) {
    database.coins[array[i]] = 1;
  }
  for (let i = 50; i < 75; i += 1) {
    database.coins[array[i]] = 2;
  }
  for (let i = 75; i < 95; i += 1) {
    database.coins[array[i]] = 5;
  }
  for (let i = 95; i < 100; i += 1) {
    database.coins[array[i]] = 10;
  }
}

exports.state = () => {
  const positions = Object.entries(database)
    .filter(([key, _]) => key.startsWith('player:'))
    .map(([key, value]) => [key.substring(7), value]);
  return {
    positions,
    coins: database.coins,
    scores: database.scores,
  };
};

exports.move = (direction) => {
  const delta = { U: [0, -1], R: [1, 0], D: [0, 1], L: [-1, 0] }[direction];
  if (delta) {
    const key = 'player:alice';
    const [x, y] = database[key].split(',');
    const [newX, newY] = [clamp(+x + delta[0], 0, WIDTH - 1), clamp(+y + delta[1], 0, HEIGHT - 1)];
    const value = database.coins[`${newX},${newY}`];
    if (value) {
      database[key] += value;
      delete database.coins[`${newX},${newY}`];
    }
    database[key] = `${newX},${newY}`;
  }
};

placeCoins();
