const z = require("zod");
const districts = require("../constants/districts");

const companyTypeEnum = z.enum([
  "Product",
  "Service",
  "Consulting",
  "Startup",
  "MNC",
  "Other",
]);

// Create company schema
const createCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Company name is required").max(100, "Name too long"),
    district: z.enum(districts, { error: "Select a valid Tamil Nadu district" }),
    address: z.string().trim().max(200, "Address too long").optional().or(z.literal("")),
    additionalAddress: z.string().trim().max(200, "Additional address too long").optional().or(z.literal("")),
    website: z.string().trim().max(100, "Website too long").optional().or(z.literal("")),
    contactPerson: z.string().trim().max(50, "Contact person too long").optional().or(z.literal("")),
    contactNumber: z.string().trim().max(20, "Contact number too long").optional().or(z.literal("")),
    email: z.string().trim().email("Invalid email").max(100, "Email too long").optional().or(z.literal("")),
    companyType: companyTypeEnum.optional(),
    notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  }),
});

// Update company schema (all fields optional)
const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Company name is required").max(100, "Name too long").optional(),
    district: z.enum(districts, { error: "Select a valid Tamil Nadu district" }).optional(),
    address: z.string().trim().max(200, "Address too long").optional(),
    additionalAddress: z.string().trim().max(200, "Additional address too long").optional(),
    website: z.string().trim().max(100, "Website too long").optional(),
    contactPerson: z.string().trim().max(50, "Contact person too long").optional(),
    contactNumber: z.string().trim().max(20, "Contact number too long").optional(),
    email: z.string().trim().email("Invalid email").max(100, "Email too long").optional(),
    companyType: companyTypeEnum.optional(),
    notes: z.string().max(1000, "Notes too long").optional(),
  }),
});

// Query params schema
const companyQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^[1-9]\d*$/).optional(),
    limit: z.string().regex(/^[1-9]\d*$/).optional(),
    sort: z.enum(["name", "district", "companyType", "createdAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().optional(),
    district: z.enum(districts).optional(),
    address: z.string().optional(),
    companyType: companyTypeEnum.optional(),
  }),
});

const companyIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid company ID"),
  }),
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
  companyQuerySchema,
  companyIdSchema,
};