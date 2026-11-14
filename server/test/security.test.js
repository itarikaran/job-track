const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-jobtrack";
process.env.FRONTEND_URL = "http://localhost:5173";

const app = require("../app");
const sendToken = require("../utils/sendToken");
const { protect } = require("../middleware/authMiddleware");
const {
  createCompanySchema,
  updateCompanySchema,
} = require("../validation/companySchema");
const { createApplicationSchema } = require("../validation/applicationSchema");

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("protected dashboard endpoint rejects missing authentication", async () => {
  const response = await fetch(`${baseUrl}/api/dashboard/stats`);
  assert.equal(response.status, 401);
});

test("unsafe requests reject missing or foreign origins", async () => {
  const missingOrigin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(missingOrigin.status, 403);

  const foreignOrigin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://attacker.example",
    },
    body: JSON.stringify({}),
  });
  assert.equal(foreignOrigin.status, 403);
});

test("invalid JWT is rejected by authentication middleware", async () => {
  const response = await fetch(`${baseUrl}/api/dashboard/stats`, {
    headers: { cookie: "token=not-a-valid-jwt" },
  });
  assert.equal(response.status, 401);
});

test("request schemas remove system fields and reject invalid references", () => {
  const company = createCompanySchema.parse({
    body: { name: "Acme", district: "Colombo", userId: "attacker" },
  });
  assert.equal(company.body.userId, undefined);

  const update = updateCompanySchema.parse({
    body: { notes: "Updated", userId: "attacker", createdAt: "changed" },
  });
  assert.deepEqual(update.body, { notes: "Updated" });

  const application = createApplicationSchema.safeParse({
    body: { companyId: "not-an-object-id", jobRole: "Engineer" },
  });
  assert.equal(application.success, false);
});

test("JWT cookie is HttpOnly, SameSite strict, and duration-aware", () => {
  process.env.JWT_EXPIRES_IN = "12h";
  let cookie;
  const response = {
    cookie(name, value, options) {
      cookie = { name, value, options };
    },
    status() {
      return this;
    },
    json() {},
  };
  sendToken(
    { _id: "507f1f77bcf86cd799439011", email: "test@example.com", role: "user" },
    200,
    response
  );
  assert.equal(cookie.name, "token");
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, "strict");
  assert.equal(cookie.options.maxAge, 12 * 60 * 60 * 1000);
  assert.equal(
    jwt.verify(cookie.value, process.env.JWT_SECRET, { algorithms: ["HS256"] }).email,
    "test@example.com"
  );
});

test("protect rejects tokens signed with an unsupported algorithm", async () => {
  const token = jwt.sign(
    { id: "507f1f77bcf86cd799439011" },
    process.env.JWT_SECRET,
    { algorithm: "HS384" }
  );
  const next = (error) => {
    assert.equal(error.statusCode, 401);
  };
  await protect(
    { cookies: { token } },
    {},
    next
  );
});
