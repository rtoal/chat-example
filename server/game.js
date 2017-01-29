/*
 * Server side game module. Maintains the game state and processes all the messages from clients.
 *
 * Exports:
 *   - addPlayer(name)
 *   - move(direction, name)
 *   - state()
 */

const { clamp, randomPoint, permutation } = require('./gameutil');

// https://www.npmjs.com/package/redis
const redis = require('redis');
const client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

const WIDTH = 64;
const HEIGHT = 64;
const MAX_PLAYER_NAME_LENGTH = 32;
const NUM_COINS = 100;


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
// player:<name>    string       "<row>,<col>"
// scores           sorted set   playername with score
// coins            hash         { "<row>,<col>": coinvalue }
// usednames        set          all used names, to check quickly if a name has been used
//
const database = {
  scores: {},
  usednames: new Set(),
  coins: {},
};

exports.addPlayer = (name) => {
  if (name.length === 0 || name.length > MAX_PLAYER_NAME_LENGTH || client.sismember("usednames", name) === 1) {
    return false;
  }
  client.sadd("usednames", name);
  client.set(`player:${name}`, randomPoint(WIDTH, HEIGHT).toString());
  client.zadd("scores", 0, name);
  return true;
};

function placeCoins() {
  permutation(WIDTH * HEIGHT).slice(0, NUM_COINS).forEach((position, i) => {
    const coinValue = (i < 50) ? 1 : (i < 75) ? 2 : (i < 95) ? 5 : 10;
    const index = `${Math.floor(position / WIDTH)},${Math.floor(position % WIDTH)}`;
    client.hset("coins", index, coinValue);
  });
}

// Return only the parts of the database relevant to the client. The client only cares about
// the positions of each player, the scores, and the positions (and values) of each coin.
// Note that we return the scores in sorted order, so the client just has to iteratively
// walk through an array of name-score pairs and render them.
exports.state = () => {
  const positions = client.keys("player:").map((key) => [key.substring(7), client.get(key)]);
  const raw_scores = client.zrevrange("scores", 0, -1, "WITHSCORES");

  let temp_scores = [];
  for (let i = 0; i < scores.length; i+=2) {
    scores[i] = [raw_scores[i], raw_scores[i+1]];
  }
  const scores = tempt_scores.slice();

  const coins = client.hkeys("coins").map((key) => [key, client.hget("coins", key)]);
  return {
    positions,
    scores,
    coins: coins,
  };
};

exports.move = (direction, name) => {
  const delta = { U: [0, -1], R: [1, 0], D: [0, 1], L: [-1, 0] }[direction];
  if (delta) {
    const playerKey = `player:${name}`;
    const [x, y] = client.get(playerKey).split(',');
    const [newX, newY] = [clamp(+x + delta[0], 0, WIDTH - 1), clamp(+y + delta[1], 0, HEIGHT - 1)];
    const value = client.hget("coins", `${newX},${newY}`);
    if (value) {
      client.zincrby("scores", value, name);
      client.hdel("coins", `${newX},${newY}`);
    }
    client.set(playerKey, `${newX},${newY}`);

    // When all coins collected, generate a new batch.
    if (client.hlen("coins") === 0) {
      placeCoins();
    }
  }
};

placeCoins();
