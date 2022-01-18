module.exports = {
  '*': ['yarn prettier --write --ignore-unknown'],
  '*.{ts,tsx,js,jsx}': ['eslint --fix'],
};
