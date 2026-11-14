const z = require("zod");
const districts = require("../constants/districts");

const statuses = [
  "Interested",
  "Applied",
  "Assessment",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
  "Offer Received",
  "Offer Accepted",
  "Offer Declined",
  "Withdrawn",
];
const jobTypes = ["Full-time", "Internship", "Contract", "Part-time", "Freelance"];
const sources = ["Company Website", "Naukri", "LinkedIn", "Indeed", "Referral", "Other"];
const interviewModes = ["Online", "In-person", "Phone"];
const id = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(""));
const date = z.coerce.date({ message: "Invalid date" });
const optionalDate = z.union([date, z.literal("")]).optional();

const applicationFields = {
  companyId: id,
  jobRole: z.string().trim().min(1, "Job role is required").max(150),
  jobDescription: optionalText(5000),
  jobType: z.enum(jobTypes).optional(),
  appliedDate: date,
  applicationSource: z.enum(sources).optional(),
  salary: optionalText(100),
  interviewDate: optionalDate,
  interviewMode: z.enum(interviewModes).optional(),
  interviewLocation: optionalText(200),
  notes: optionalText(2000),
};

const createApplicationSchema = z.object({
  body: z.object({
    ...applicationFields,
    status: z.enum(statuses).optional(),
    statusNotes: optionalText(1000),
  }),
});

const updateApplicationSchema = z.object({
  body: z.object({
    ...applicationFields,
    companyId: id.optional(),
    appliedDate: date.optional(),
  }),
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(statuses),
    notes: optionalText(1000),
  }),
});

const applicationQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^[1-9]\d*$/).optional(),
    limit: z.string().regex(/^[1-9]\d*$/).optional(),
    sort: z.enum(["jobRole", "appliedDate", "status", "createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().trim().optional(),
    district: z.enum(districts).optional(),
    companyId: id.optional(),
    status: z.enum(statuses).optional(),
    jobType: z.enum(jobTypes).optional(),
    appliedFrom: z.string().date().optional(),
    appliedTo: z.string().date().optional(),
  }),
});

const applicationIdSchema = z.object({ params: z.object({ id }) });

module.exports = {
  createApplicationSchema,
  updateApplicationSchema,
  statusSchema,
  applicationQuerySchema,
  applicationIdSchema,
};
