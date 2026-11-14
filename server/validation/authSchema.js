const z = require("zod");

// Common schemas
const emailSchema = z.string().trim().toLowerCase().email("Invalid email address");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password is too long");
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name is too long");

// Register schema
const registerSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

// Login schema
const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

// Profile update schema
const profileSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    currentPassword: z.string().optional(),
    newPassword: passwordSchema.optional(),
  }).refine(
    (data) => {
      // If newPassword is provided, currentPassword must also be provided
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required to set a new password",
      path: ["currentPassword"],
    }
  ),
});

module.exports = {
  registerSchema,
  loginSchema,
  profileSchema,
};