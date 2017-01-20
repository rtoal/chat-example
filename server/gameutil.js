exports.clamp = (value, low, high) => Math.max(low, Math.min(high, value));

exports.randomPoint = (maxX, maxY) => [
  Math.floor(Math.random() * maxX),
  Math.floor(Math.random() * maxY),
];

// Returns an array of size n with the values 0..n-1 in random positions.
exports.permutation = (n) => {
  const array = Array(n).fill(0).map((_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
