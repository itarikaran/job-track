/**
 * Zod request validation wrapper.
 * Schemas should expect the shape { body: {...} } matching req.
 * Usage: validateMiddleware(schema) validates req.body via req.
 */
const validateMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req);
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (err) {
      const issues = err.issues || err.errors || [];
      const errors = issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
  };
};

module.exports = validateMiddleware;