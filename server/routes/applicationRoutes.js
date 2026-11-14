const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");
const {
  createApplicationSchema,
  updateApplicationSchema,
  statusSchema,
  applicationQuerySchema,
  applicationIdSchema,
} = require("../validation/applicationSchema");

const router = express.Router();
router.use(protect);

router
  .route("/")
  .get(validateMiddleware(applicationQuerySchema), getApplications)
  .post(validateMiddleware(createApplicationSchema), createApplication);
router
  .route("/:id/status")
  .patch(
    validateMiddleware(applicationIdSchema),
    validateMiddleware(statusSchema),
    updateApplicationStatus
  );
router
  .route("/:id")
  .get(validateMiddleware(applicationIdSchema), getApplication)
  .put(
    validateMiddleware(applicationIdSchema),
    validateMiddleware(updateApplicationSchema),
    updateApplication
  )
  .delete(validateMiddleware(applicationIdSchema), deleteApplication);

module.exports = router;
