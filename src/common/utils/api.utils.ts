/**
 * Returns the numeric sort direction based on the provided expression.
 * Without an argument, the function returns -1, otherwise it returns
 * the appropriate value. If an invalid argument is given, the function returns an error
 *
 * @param {string=} value
 * @returns {number}
 */
export const getSortingDirectionByString = (value?: string): 1 | -1 => {
  if (value) {
    if (value.toLowerCase() === 'asc') return 1;
    if (value.toLowerCase() === 'desc') return -1;
    throw new Error('Sort must be either "asc" or "desc"');
  }
  return -1;
};
