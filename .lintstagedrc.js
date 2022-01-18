module.exports = {
  '*': ['yarn prettier --write'],
  '*.{ts,tsx,js,jsx}': ['eslint --fix'],
};
