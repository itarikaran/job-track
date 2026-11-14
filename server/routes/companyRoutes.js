const express = require("express");
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect } = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");
const {
  createCompanySchema,
  updateCompanySchema,
  companyQuerySchema,
  companyIdSchema,
} = require("../validation/companySchema");

const router = express.Router();

// All routes are private (require authentication)
router.use(protect);

router
  .route("/")
  .get(validateMiddleware(companyQuerySchema), getCompanies)
  .post(validateMiddleware(createCompanySchema), createCompany);

router
  .route("/:id")
  .get(validateMiddleware(companyIdSchema), getCompany)
  .put(
    validateMiddleware(companyIdSchema),
    validateMiddleware(updateCompanySchema),
    updateCompany
  )
  .delete(validateMiddleware(companyIdSchema), deleteCompany);

module.exports = router;