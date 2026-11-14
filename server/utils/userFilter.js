/**
 * Returns a MongoDB filter object scoped to the authenticated user.
 * Ensures strict user data isolation on every query.
 */
const userFilter = (req) => {
  return { userId: req.user._id };
};

module.exports = userFilter;